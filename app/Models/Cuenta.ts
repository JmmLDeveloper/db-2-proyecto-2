
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'


export default class Cuenta extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public numero_de_cuenta: number

  @column()
  public saldo: number


}
