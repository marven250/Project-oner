import axios from "axios";
import { User } from "../Models/user";
import { Reimbursement } from "../Models/Reimbursement";

// For project work, take note that axios interprets non-200s responses statuses as errors.
// This means you can handle auth problems using try-catch.

//We can create a client with config for convenience, then call our methods
// on that client instead of on axios directly.  This lets up set up configuration
// without repeating ourselves
const infoClient = axios.create({
  baseURL: "http://localhost:5000",
  // If you don't have the following line, your login won't work!
  withCredentials: true,
});

//Library-express is running on my EC2 with public IP 18.232.125.207
// export async function getAllBooks() {
//   const response = await libraryClient.get("/books");
//   return response.data.map((bookObj) => {
//     const { id, title, author, yearPublished, wordCount } = bookObj;
//     // return new Book(id, title, author, yearPublished, wordCount);
//   });
// }

export async function getAllUsers() {
  const response = await infoClient.get("/users");
  return response.data.map((userObj) => {
    const { id, username, password, email, role } = userObj;
    return new User(id, username, password, email, role);
  });
}

export async function submitReimbursement(amount, description, type) {
  try {
    const response = await infoClient.post("/reimbursements", {
      amount,
      description,
      type,
    });
    // console.log("reimbursmeents req response:", response);
    return response.data;
    // return new Reimbursement(
    //   response.dataauthor,
    //   response.dataamount,
    //   response.datadateSubmitted,
    //   response.datadateResolved,
    //   response.datadescription,
    //   response.dataresolver,
    //   response.datastatus,
    //   response.datartype
    // );
  } catch (e) {
    console.error(e.message);
  }
}

export async function patchUser(id, firstname, lastname, password, email) {
  //console.log("in patch function", sessionStorage.getItem("user"));
  if (id === 0) id = JSON.parse(sessionStorage.getItem("user")).id;
  let request = {
    id: id,
    firstname: firstname,
    lastname: lastname,
    password: password,
    email: email,
  };
  //console.log("this is our request", request, JSON.stringify(request));
  // console.log(
  //   "this is our request",
  //   request,
  //   "parse request: ",
  //   JSON.parse(request),
  //   "-----",
  //   JSON.stringify(request)
  // );
  const response = await infoClient.patch("/users", request);

  // console.log("this is path user response:", response.data);
  // console.log("This si our logged in user", response.data);
  // console.log("extracted values:", email, role, id, username);
  return new User(
    response.data.id,
    response.data.username,
    response.data.firstname,
    response.data.lastname,
    response.data.password,
    response.data.email,
    response.data.role_id
  );
  //console.log(response);
}

export async function getCurrentUserReimbursements() {
  const response = await infoClient.get(
    `/reimbursements/author/userId/${
      JSON.parse(sessionStorage.getItem("user")).id
    }`
  );
  return response.data.map((currentUserReimbursementObj) => {
    const {
      id,
      author,
      amount,
      dateresolved,
      datesubmitted,
      description,
      resolver,
      rtype,
      status,
    } = currentUserReimbursementObj;
    return new Reimbursement(
      id,
      author,
      amount,
      datesubmitted,
      dateresolved,
      description,
      resolver,
      status,
      rtype
    );
  });
}

export async function getPendingReimbursements() {
  const response = await infoClient.get("/reimbursements/status/1");
  return response.data.map((pendingReimbursementObj) => {
    //const {id, author,amount, datesubmitted, dateresolved, description, resolver, status} = pendingReimbursementObj;
    console.log("these are pending requests:", pendingReimbursementObj);
  });
}

export async function getApprovedReimbursements() {
  const response = await infoClient.get("/reimbursements/status/2");
  return response.data.map((approvedReimbursementObj) => {
    //const {id, author,amount, datesubmitted, dateresolved, description, resolver, status} = pendingReimbursementObj;
    console.log("these are approved requests:", approvedReimbursementObj);
  });
}

export async function getDeclinedReimbursements() {
  const response = await infoClient.get("/reimbursements/status/3");
  return response.data.map((declinedReimbursementObj) => {
    //const {id, author,amount, datesubmitted, dateresolved, description, resolver, status} = pendingReimbursementObj;
    console.log("these are declined requests:", declinedReimbursementObj);
  });
}

export async function login(un, pw) {
  // console.log("in login function");
  try {
    const response = await infoClient.post("/login", {
      username: un,
      password: pw,
    });
    // console.log("successfully logged in!!");
    const {
      id,
      username,
      password,
      email,
      role,
      firstname,
      lastname,
    } = response.data;

    console.log("This si our logged in user", response.data);
    // console.log("extracted values:", email, role, id, username);
    return new User(id, username, firstname, lastname, password, email, role);
  } catch (e) {
    if (e.response.status === 401) {
      throw new Error(`Failed to authenticate ${un}`);
    } else {
      // We could throw a different custom error, this exposes a little too much to the user.
      throw e;
    }
  }
}
