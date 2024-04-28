const Pool = require("pg").Pool;
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL ,
})
//get all Orders our database
const getOrders = async () => {
  try {
    return await new Promise(function (resolve, reject) {
      pool.query("SELECT (id,status,name,total,adress) FROM orders", (error, results) => {
        if (error) {
          reject(error);
        }
        if (results && results.rows) {
            console.log(results.rows);
          resolve(results.rows);
        } else {
          reject(new Error("No results found"));
        }
      });
    });
  } catch (error_1) {
    console.error(error_1);
    throw new Error("Internal server error");
  }
};
//create a new Orders record in the databsse
const createOrder = (body) => {
  return new Promise(function (resolve, reject) {
    const { id, address, quantity, name, total } = body;
    pool.query(
      "INSERT INTO orders (customerId, name, adress,quantity,total,status) VALUES ($1, $2, $3,$4,$5,0) RETURNING *",
      [id,name,address,quantity,total ],
      (error, results) => {
        if (error) {
          reject(error);
        }
        if (results && results.rows) {
          resolve(JSON.stringify(results.rows[0].id));
        } else {
          reject(new Error("No results found"));
        }
      }
    );
  });
};
//delete a Orders
const deleteOrder = (id) => {
  return new Promise(function (resolve, reject) {
    pool.query("UPDATE orders SET status = -1 WHERE id = $1 RETURNING *", [id], (error, results) => {
      if (error) {
        reject(error);
      }
      resolve(`Order deleted with ID: ${id}`);
    });
  });
};
//update a Orders record
const updateOrder = (id,body) => {
  return new Promise(function (resolve, reject) {
    const {status } = body;
    pool.query(
      "UPDATE orders SET status = $1 WHERE id = $2 RETURNING *",
      [status,id],
      (error, results) => {
        if (error) {
          reject(error);
        }
        if (results && results.rows) {
            console.log("good")
          resolve(`Order updated: ${JSON.stringify(results.rows[0])}`);
        } else {
          reject(new Error("No results found"));
        }
      }
    );
  });
};
const getStatus=(body)=>{
    return new Promise(function (resolve, reject) {
        const { id } = body;
        pool.query(
          "SELECT status FROM orders WHERE id=$1",
          [id],
          (error, results) => {
            if (error) {
              reject(error);
            }
            if (results && results.rows) {
                console.log(results.rows[0]);
              resolve(JSON.stringify(results.rows[0].status));
            } else {
              reject(new Error("No results found"));
            }
          }
        );
      });
}


module.exports = {
  getOrders,
  createOrder,
  deleteOrder,
  updateOrder,
  getStatus
};
