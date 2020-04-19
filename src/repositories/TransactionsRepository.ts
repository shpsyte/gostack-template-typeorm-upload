import { EntityRepository, Repository, getRepository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

interface Res {
  transactions: Transaction[];
  balance: Balance;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getAllWithBalance(): Promise<Res> {
    const transactinosRepositories = getRepository(Transaction);
    const balance = await this.getBalance();
    const transactions = await transactinosRepositories.find();
    const data: Res = {
      transactions,
      balance,
    };
    return data;
  }

  public async getBalance(): Promise<Balance> {
    const balance: Balance = { income: 0, outcome: 0, total: 0 };
    const transactinosRepositories = getRepository(Transaction);
    const transactions = await transactinosRepositories.find();

    transactions.forEach(transaction => {
      if (transaction.type === 'income') {
        balance.income += +transaction.value;
      } else if (transaction.type === 'outcome') {
        balance.outcome += +transaction.value;
      }
      balance.total = balance.income - balance.outcome;
    });
    return balance;
  }
}

export default TransactionsRepository;
