import csvParse from 'csv-parse';
import fs from 'fs';
import { getRepository, In, getCustomRepository } from 'typeorm';
import TransactionRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Res {
  transactions: Transaction[];
  categories: Category[] | undefined;
}

interface CSVTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}
class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const fileReadStrem = fs.createReadStream(filePath);
    const categoriesRepository = getRepository(Category);
    const transactionRepository = getCustomRepository(TransactionRepository);

    const parsers = csvParse({
      from_line: 2,
    });

    const parseCSV = fileReadStrem.pipe(parsers);

    const transactions: CSVTransaction[] = [];
    const categories: string[] = [];

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );

      if (!title || !type || !value) return;

      categories.push(category);
      transactions.push({ title, type, value, category });
    });

    await new Promise(res => parseCSV.on('end', res));

    const existemCateories = await categoriesRepository.find({
      where: {
        title: In(categories),
      },
    });

    const existeCategoriesTitle = existemCateories.map(
      (category: Category) => category.title,
    );

    const addCategotryTitle = categories
      .filter(a => !existeCategoriesTitle.includes(a))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = categoriesRepository.create(
      addCategotryTitle.map(title => ({
        title,
      })),
    );

    await categoriesRepository.save(newCategories);

    const finalCategories = [...newCategories, ...existemCateories];

    const createdTransactions = transactionRepository.create(
      transactions.map(a => ({
        title: a.title,
        type: a.type,
        value: a.value,
        category: finalCategories.find(x => x.title === a.category),
      })),
    );

    await transactionRepository.save(createdTransactions);
    await fs.promises.unlink(filePath);

    return createdTransactions;
  }
}

export default ImportTransactionsService;
