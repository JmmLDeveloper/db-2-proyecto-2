import Route from "@ioc:Adonis/Core/Route";
import Database from "@ioc:Adonis/Lucid/Database";
import Cuenta from "App/Models/Cuenta";



Route.post("/transaccion", async (ctx) => {
  const { monto, cuenta_id_origen, cuenta_id_destino } = ctx.request.body();
  const trx = await Database.transaction(); // transaccion

  try {
    const cuenta_origen = await Cuenta.query({ client: trx })
      .forUpdate()
      .where('id', cuenta_id_origen)
      .first();
    
    const cuenta_destino = await Cuenta.query({ client: trx })
      .forUpdate()
      .where('id', cuenta_id_destino)
      .first();

    if (cuenta_destino !== null && cuenta_origen !== null) {

      if ( cuenta_origen.saldo < monto ) {
        // await trx.rollback();
        // return { error: "saldo insuficiente" };
      }

      cuenta_origen.saldo = cuenta_origen.saldo - monto;
      cuenta_destino.saldo = cuenta_destino.saldo + monto;
  
      await trx
        .insertQuery()  // Insert de la transaccion origen
        .table('transacciones')
        .insert({
          cuenta_id: cuenta_id_origen,
          monto,
          tipo: "retiro",
          balance: cuenta_origen.saldo,
        });

      await trx
        .insertQuery()  // Insert de la transaccion destino
        .table('transacciones')
        .insert({
          cuenta_id: cuenta_id_destino,
          monto,
          tipo: "deposito",
          balance: cuenta_destino.saldo,
        });

      await cuenta_origen.save();
      await cuenta_destino.save();
      await trx.commit(); // commit de la transaccion
      return { message: "transaccion realizada" };
    } else {
      await trx.rollback();
      ctx.response.status(400)
      console.log('cuentas no encontradas !')
      return { error: "cuentas no encontrada" };
    }
  } catch (error) {
    // error en la transaccion o timeout
    await trx.rollback();
    ctx.response.status(500)
    if (  error.code == 'ER_LOCK_DEADLOCK' ) {
      return { error: "la base de datos esta ocupada en este momento" };
    }
    return { error: "ocurrio un problema en el servidor" };
  }
});
Route.post("/retiro", async (ctx) => {

  const { monto, cuenta_id } = ctx.request.body();
  const trx = await Database.transaction(); // transaccion

  try {
    const cuenta = await Cuenta.query({ client: trx })
        .forUpdate()
        .where('id', cuenta_id)
        .first();
    if (cuenta !== null  ) { // Si existe la cuenta
      if (cuenta.saldo < monto) {
        await trx.rollback();
        return { message: "saldo insuficiente" };
      }
      cuenta.saldo = cuenta.saldo - monto;
      await trx.insertQuery()  // Insert de la transaccion
        .table('transacciones')
        .insert({
          cuenta_id,
          monto,
          tipo: "retiro",
          balance: cuenta.saldo,
        });
      await cuenta.save();
      await trx.commit();
      return { message: "transaccion realizada" };
    } else {
      await trx.rollback();
      return { errro: "cuenta no encontrada" };
    }
  } catch (error) {
    // error en la transaccion o timeout
    await trx.rollback();
    ctx.response.status(500)
    if (  error.code == 'ER_LOCK_DEADLOCK' ) {
      return { error: "la base de datos esta ocupada en este momento" };
    }
    return { error: "ocurrio un problema en el servidor" };
  }


});
Route.post("/deposito", async (ctx) => {
  const { monto, cuenta_id } = ctx.request.body();
  const trx = await Database.transaction(); // transaccion

  try {
    const cuenta = await Cuenta
      .query({ client: trx })
      .forUpdate()
      .where('id', cuenta_id)
      .first();
    if (cuenta !== null) { // Si existe la cuenta
      cuenta.saldo = cuenta.saldo + monto;
      await trx
        .insertQuery()  // Insert de la transaccion
        .table('transacciones')
        .insert({
          cuenta_id,
          monto,
          tipo: "deposito",
          balance: cuenta.saldo
        });
      await cuenta.save();
      await trx.commit();
      return { message: "transaccion realizada" };
    } else {
      await trx.rollback();
      return { errro: "cuenta no encontrada" };
    }
  } catch (error) {
    // error en la transaccion o timeout
    await trx.rollback();
    ctx.response.status(500)
    if (  error.code == 'ER_LOCK_DEADLOCK' ) {
      return { error: "la base de datos esta ocupada en este momento" };
    }
    return { error: "ocurrio un problema en el servidor" };
  }
});


Route.post("/reset", async (ctx) => {
  let cuentas = await Cuenta.all();

  for (let cuenta of cuentas) {
    cuenta.saldo = 0;
    cuenta.save();
  }

  await Database.rawQuery("DELETE FROM transacciones");
  return {
    message: "base de datos reiniciada",
  };
});

Route.get("/cuentas/:id", async (ctx) => {
  const { id } = ctx.params;

  const cuenta = await Cuenta.find(id);

  if (cuenta !== null) {
    return cuenta;
  }

  return {
    errro: "cuenta no encontrada",
  };
});


Route.post("/", async () => {
  return { hello: "world" };
})