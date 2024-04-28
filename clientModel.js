const Pool = require("pg").Pool;
const bcrypt = require("bcrypt")
const saltRounds = 10
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL ,
})
//get all Clients our database
const getClients = async () => {
  try {
    return await new Promise(function (resolve, reject) {
      pool.query("SELECT * FROM clients", (error, results) => {
        if (error) {
          reject(error);
        }
        if (results && results.rows) {
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
//create a new Client record in the databsse
const createClient = (body) => {
  return new Promise(function (resolve, reject) {
    const { name, email, password } = body;
    pool.query("SELECT id FROM clients WHERE email = $1 ",
    [ email],(error, results) => {
      if (error) {
        reject(error);
      }
      if (results && results.rows && results.rows[0]) {
        resolve(JSON.stringify("email already in use"));
      } else {
      bcrypt.genSalt(saltRounds, function(err, salt) {
        bcrypt.hash(password, salt, function(err, hash) {
            if (err){ reject(err)};
            pool.query(
              "INSERT INTO clients (name, email,password) VALUES ($1, $2, $3) RETURNING *",
              [name, email, hash],
              (error, results) => {
                if (error) {
                  reject(error);
                }
                if (results && results.rows) {
                  resolve(
                    JSON.stringify(results.rows[0].id)
                  );
                } else {
                  reject(new Error("No results found"));
                }
              }
            );
        });
    });
      }
    });
  });
};
//delete a Client
const deleteClient = (id) => {
  return new Promise(function (resolve, reject) {
    pool.query(
      "DELETE FROM clients WHERE id = $1",
      [id],
      (error, results) => {
        if (error) {
          reject(error);
        }
        resolve(`Client deleted with ID: ${id}`);
      }
    );
  });
};
//update a Client record
const updateClient = (id, body) => {
  return new Promise(function (resolve, reject) {
    const { name, email } = body;
    pool.query(
      "UPDATE clients SET name = $1, email = $2 WHERE id = $3 RETURNING *",
      [name, email, id],
      (error, results) => {
        if (error) {
          reject(error);
        }
        if (results && results.rows) {
          resolve(`Client updated: ${JSON.stringify(results.rows[0])}`);
        } else {
          reject(new Error("No results found"));
        }
      }
    );
  });
};

//login a Client record
const loginClient = (body) => {
  return new Promise(function (resolve, reject) {
    const { email, password } = body;
    pool.query(
      "SELECT id,password FROM clients WHERE email = $1 ",
      [ email],
      (error, results) => {
        if (error) {
          reject(error);
        }
        if (results && results.rows&& results.rows[0]) {
          bcrypt.compare(password, results.rows[0].password, function(err, result) {
            if (err){ reject(err)};
            if (result === true) {
                resolve(JSON.stringify(results.rows[0].id));
            } else {
              resolve(JSON.stringify(-1));
            }

        });
        } else {
          reject(new Error("No results found"));
        }
      }
    );
  });
};

module.exports = {
  getClients,
  createClient,
  deleteClient,
  updateClient,
  loginClient
};