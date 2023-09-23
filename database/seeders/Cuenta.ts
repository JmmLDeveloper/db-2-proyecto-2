import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Cuenta from 'App/Models/Cuenta';


export default class extends BaseSeeder {
  public async run () {
    
    for( let i = 1; i <= 5; i++ ){
      //create Cuenta
      await  Cuenta.create({
        numero_de_cuenta: i,
        saldo: i * 0
      })
    }
  }
}
