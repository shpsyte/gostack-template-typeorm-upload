import { getRepository } from 'typeorm';
import Category from '../models/Category';

class CreateTransactionService {
  public async execute(category: string): Promise<Category> {
    const categoryRepository = getRepository(Category);

    let categoryFromName = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!categoryFromName) {
      categoryFromName = categoryRepository.create({ title: category });

      await categoryRepository.save(categoryFromName);
    }

    return categoryFromName;
  }
}

export default CreateTransactionService;
