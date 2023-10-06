import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'cuentas'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('numero_de_cuenta')
      table.integer('saldo')
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
