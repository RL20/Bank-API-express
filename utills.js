// 1. userId  2. name  3. cash 4. credit
// 1. Create a user 2. Read a user 3. Update a user 4. Delete a user
const fs = require("fs");
const chalk = require("chalk");
// const { v4: uuidv4 } = require("uuid");

const getUsers = () => {
  const users = loadUsers();
  return users;
};

const getUser = (id) => {
  const users = loadUsers();
  const userToGet = users.find((usr) => usr.userId === id);
  if (!userToGet) {
    console.log(chalk.red("User not found"));
    throw Error("User not found");
  } else {
    console.log(chalk.inverse.green("User Name: " + userToGet.name));
    console.log("userToGet2", userToGet);
    return userToGet;
  }
};

const addUser = (obj) => {
  console.log("reach addUser");
  const users = loadUsers();
  const duplicated = users.find((usr) => usr.userId === obj.userId);
  if (!duplicated) {
    users.push(obj);
    saveUsers(users);
    console.log(chalk.inverse.green("user successfully  added"));
    return obj;
  } else {
    console.log(chalk.inverse.red("user already exist"));
    throw Error("The user is allready exist");
  }
};

const updateUser = (id, obj /*{ userId, name, cash, credit }*/) => {
  const users = loadUsers();
  let userToUpdate = users.find((user) => user.userId === id);
  if (!userToUpdate) {
    console.log(chalk.red("User not found"));
    throw Error("User not found");
  } else {
    // userToUpdate = { ...userToUpdate, ...obj };

    console.log(`userToUp`, userToUpdate);
    if (obj.name) {
      userToUpdate.name = obj.name;
    }
    if (obj.cash) {
      userToUpdate.cash = obj.cash;
    }
    if (obj.credit) {
      userToUpdate.credit = obj.credit;
    }
    saveUsers(users);
    console.log(chalk.inverse.green("User updated"));
    return "User updated successfully";
  }
};

const removeUser = (id) => {
  const users = loadUsers();
  const newUsers = users.filter((usr) => {
    return usr.userId !== id;
  });

  if (users.length === newUsers.length) {
    console.log(chalk.inverse.red("User not found"));
    throw Error(" User not found");
  } else {
    saveUsers(newUsers);
    console.log(chalk.inverse.green("User deleted"));
    return "User deleted successfully";
  }
};
//? actions function---------------------------------------------------------------
const deposit = (id, amount) => {
  const user = getUser(id);
  user.cash = user.cash + amount;
  return updateUser(id, user);
};
const updateCredit = (id, newCredit) => {
  if (newCredit > 0) {
    const user = getUser(id);
    user.credit = newCredit;
    return updateUser(id, user);
  } else throw Error("Credit can not be negetive");
};
const withdraw = (id, amount) => {
  const user = getUser(id);
  const withdrawMax = user.cash + user.credit;
  if (amount <= withdrawMax) {
    user.cash = user.cash - amount;
    if (user.cash < 0) user.credit = user.credit + user.cash;
    return updateUser(id, user);
  } else throw Error(`the maximun amount you can withdraw is ${withdrawMax}`);
};
const transfer = (depositorId, beneficiaryId, amount) => {
  const user = getUser(depositorId);
  const withdrawMax = user.cash + user.credit;
  const depositorCashBefore = user.cash;
  const depositorCreditBefore = user.credit;
  if (!withdraw(depositorId, amount)) {
    throw Error(`the maximun amount you can transfer is ${withdrawMax}`);
  }

  try {
    deposit(beneficiaryId, amount);
  } catch (e) {
    //roll back
    console.log(`enter deposit`);
    user.cash = depositorCashBefore;
    user.credit = depositorCreditBefore;
    updateUser(depositorId, user);
    throw Error(`we are sorry,the action was failed please try again later`);
  }
  return `transfer ${amount} to ${getUser(beneficiaryId).name} complited successfully`;
};
// const transfer = (depositorId, beneficiaryId, amount) => {
//   try {
//     withdraw(depositorId, amount);
//     deposit(beneficiaryId, amount);
//     return `transfer ${amount} to ${getUser(beneficiaryId).name} complited successfully`;
//   } catch (e) {
//     const user = getUser(depositorId);
//     const withdrawMax = user.cash + user.credit;
//     throw Error(`the maximun amount you can transfer is ${withdrawMax}`);
//   }
// };

// Can deposit cash to a user. (by the users passport id and
// amount of cash)

// Update credit
// Can update a users credit (only positive numbers)

// Withdraw money
// Can withdraw money from the user (can withdraw money until
// the cash and credit run out)

// Transferring
// Can transfer money from one user to another with credit(can
// transfer money until the cash and credit run out)

//! helper functions---------------------------------------------------------------
const loadUsers = () => {
  //helper func to extract from JSON
  try {
    const dataBuffer = fs.readFileSync("./db/users.json");
    const dataJSON = dataBuffer.toString();
    return JSON.parse(dataJSON);
  } catch (e) {
    return []; //in case we don't have yet the users.json
  }
};
saveUsers = (users) => {
  const dataJSON = JSON.stringify(users);
  fs.writeFileSync("./db/users.json", dataJSON);
};
//!--------------------------------------------------------------------------------

module.exports = {
  getUsers,
  getUser,
  addUser,
  updateUser,
  removeUser,
  deposit,
  updateCredit,
  withdraw,
  transfer,
};
