// import AppError from '../errors/AppError';

import { getCustomRepository, getRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CategoryServices from './CategoriServices';

import AppError from '../errors/AppError';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const categoryServices = new CategoryServices();
    const categoryObj = await categoryServices.execute(category);
    await this.CheckIfCanAddOutcome(type, transactionRepository, value);
    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category: categoryObj,
    });
    await transactionRepository.save(transaction);
    return transaction;
  }

  private async CheckIfCanAddOutcome(
    type: string,
    transactionRepository: TransactionsRepository,
    value: number,
  ): Promise<void> {
    if (type === 'outcome') {
      const balance = await transactionRepository.getBalance();
      const { total } = balance;
      if (value > total) {
        throw new AppError('Value for outcome is bigger than total value');
      }
    }
  }
}

export default CreateTransactionService;
