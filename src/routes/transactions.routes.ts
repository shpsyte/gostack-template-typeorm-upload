import { Router } from 'express';

import { getCustomRepository, getRepository } from 'typeorm';
import multer from 'multer';
import path from 'path';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

import uploadConfig from '../config/upload';
import Category from '../models/Category';

const upload = multer(uploadConfig);

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  const transactinosRepositories = getCustomRepository(TransactionsRepository);
  const data = await transactinosRepositories.getAllWithBalance();
  return response.json(data);
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;
  const createTransaction = new CreateTransactionService();
  const transaction = await createTransaction.execute({
    title,
    value,
    type,
    category,
  });

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const deleteTransactionService = new DeleteTransactionService();
  const { id } = request.params;
  await deleteTransactionService.execute(id);

  return response.status(204).send();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const importTransactionsService = new ImportTransactionsService();
    const tansactionsAndCategories = await importTransactionsService.execute(
      request.file.path,
    );

    return response.json(tansactionsAndCategories);
  },
);

export default transactionsRouter;
