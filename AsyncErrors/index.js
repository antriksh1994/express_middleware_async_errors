const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const Product = require("./models/product");
const mothedOverride = require("method-override");
const AppError = require("../AppError");

// app.use(req, res) runs on every request
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(mothedOverride("_method"));

mongoose
  .connect("mongodb://127.0.0.1:27017/farmStand2")
  .then(() => {
    console.log("MONGO CONNECTION OPEN ASYNC ERRORS!!");
  })
  .catch((err) => {
    console.log("===err===", err);
  });

app.get("/products/new", async (req, res) => {
  res.render("products/new");
});

app.get(["/products", '/'], async (req, res) => {
  const { category } = req.query;
  if (category) {
    const products = await Product.find({ category });
    res.render("products/index", { products, category });
  }
  const products = await Product.find({});
    // res.send('ALL PRODUCTS WILL BE HERE')
    res.render("products/index", { products, category: 'ALL' });
});
// try and catch are used here to handle the errors thrown by mongoose or by the user

app.get("/products/:id", wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findById(id)
      if (!product) {
        // in async functions we need to pass error in next
        throw new AppError ('PRODUCT NOT FOUND!!', 404)
      }
      console.log("product", product);
      res.render("products/details", { product });
}));

// wrapAsync is a function which returns another function and catches errors
function wrapAsync(fn) {
  return function (req, res, next) {
    fn(req, res, next).catch(e=> {
      next(e)
    })
  }
}

app.use((err, req, res, next) => {
  console.log('=errName=', err.name)
  next(err)
})

app.get("/products/:id/edit",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id)
    console.log("product", product);
    res.render("products/edit", { product });
  })
);

// create new product post call
app.post("/products/", wrapAsync(async (req, res, next) => {
    const newProduct = new Product(req.body);
    await newProduct.save();
    console.log(req.body);
    res.redirect(`/products/${newProduct._id}`);
}));

// delete and put requests cannot be made from HTML form so we use override
app.delete("/products/:id", async (req, res) => {
  const { id } = req.params;
  const product = await Product.findByIdAndDelete(id, req.body, {
    runValidators: true,
    new: true,
  });
  // res.send('PUTT!!')
  res.redirect("/products");
});

app.put("/products/:id", wrapAsync(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findByIdAndUpdate(id, req.body, {
    runValidators: true,
    new: true,
  });
  // res.send('PUTT!!')
  res.redirect(`/products/${product._id}`);
}));
const handleValidationErr = err => {
  console.dir(err)
  return new AppError(`Validation Failed... ${err.message}`, 400)
}
app.use((err, req, res, next) => {
  const { status = 500, message = 'SOMETHING WENT WRONG' } = err
  console.log('==error name is ==', err.name)
  if (err.name === 'ValidationError') err = handleValidationErr(err)
    next(err)
  // res.status(status).send(message)
})

app.listen(3000, () => {
  console.log("APP IS LISTENING ON PORT 3000!");
});
