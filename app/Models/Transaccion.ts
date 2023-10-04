import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'


export default class Transaccion extends BaseModel {
  public static table = 'transacciones'
  

  @column({ isPrimary: true })
  public id: number

  @column()
  public cuenta_id: number

  @column()
  public monto: number

  @column()
  public tipo: string

  @column()
  public balance: number
}
