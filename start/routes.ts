/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from "@ioc:Adonis/Core/Route";
import Database from "@ioc:Adonis/Lucid/Database";

import Cuenta from "App/Models/Cuenta";
import Transaccion from "App/Models/Transaccion";


Route.post("/", async () => {
  return { hello: "world" };
})

Route.post("/transaccion", async (ctx) => {
  const { monto, cuenta_id_origen, cuenta_id_destino } = ctx.request.body();

  const cuenta_origen = await Cuenta.find(cuenta_id_origen);
  const cuenta_destino = await Cuenta.find(cuenta_id_destino);

  if (cuenta_destino !== null && cuenta_origen !== null) {
    cuenta_origen.saldo = cuenta_origen.saldo - monto;
    cuenta_destino.saldo = cuenta_destino.saldo + monto;

    await Transaccion.create({
      cuenta_id: cuenta_id_origen,
      monto,
      tipo: "retiro",
      balance: cuenta_origen.saldo,
    });

    await Transaccion.create({
      cuenta_id: cuenta_id_destino,
      monto,
      tipo: "deposito",
      balance: cuenta_destino.saldo,
    });

    await cuenta_origen.save();
    await cuenta_destino.save();

    return {
      message: "transaccion realizada",
    };
  } else {
    return {
      error: "cuentas no encontrada",
    };
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

// Ruta para deposito
// trx se utiliza para identificar la transaccion, siendo necesario
// para MySQL para poder crear el bloqueo utilizando forUpdate() en los query
Route.post("/deposito", async (ctx) => {
  const { monto, cuenta_id } = ctx.request.body();
  const trx = await Database.transaction(); // transaccion

  try {
    const cuenta = await Cuenta.query({ client: trx })
        .forUpdate()
        .where('id', cuenta_id)
        .first();
    if (cuenta !== null) { // Si existe la cuenta
      cuenta.saldo = cuenta.saldo + monto;
      await trx.insertQuery()  // Insert de la transaccion
        .table('transacciones')
        .insert({
          cuenta_id,
          monto,
          tipo: "deposito",
          balance: cuenta.saldo,
        });
      await cuenta.save();
      await trx.commit();
    } else {
      await trx.rollback();
      return { errro: "cuenta no encontrada" };
    }
  } catch (error) { // error en la transaccion o timeout
    await trx.rollback();
    return { errro: "error en transaccion" };
  }
});

// Ruta para retiro
// trx se utiliza para identificar la transaccion, siendo necesario
// para MySQL para poder crear el bloqueo utilizando forUpdate() en los query
Route.post("/retiro", async (ctx) => {
  const { monto, cuenta_id } = ctx.request.body();
  const trx = await Database.transaction(); // transaccion

  try {
    const cuenta = await Cuenta.query({ client: trx })
        .forUpdate()
        .where('id', cuenta_id)
        .first();
    if (cuenta !== null) { // Si existe la cuenta
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
    } else {
      await trx.rollback();
      return { errro: "cuenta no encontrada" };
    }
  } catch (error) { // error en la transaccion o timeout
    await trx.rollback();
    return { errro: "error en transaccion" };
  }
});
