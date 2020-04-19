import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export default class TransactionsCreate1587255148150
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'transactions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4 ()',
          },
          {
            name: 'title',
            type: 'varchar',
          },
          {
            name: 'type',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'value',
            type: 'decimal',
          },
          {
            name: 'category_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
    );

    const foreignKey = new TableForeignKey({
      columnNames: ['category_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'categories',
    });

    await queryRunner.createForeignKey('transactions', foreignKey);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('transactions');
  }
}
