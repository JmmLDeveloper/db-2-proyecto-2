import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'transacciones'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('cuenta_id').unsigned().references('cuentas.id')
      table.integer('monto')
      table.enum('tipo', ['deposito', 'retiro'])
      table.integer('balance')
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
