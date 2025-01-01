let cart = []; // Mảng lưu trữ giỏ hàng
let isLoggedIn = false; // Trạng thái đăng nhập
let currentCartId = null; // ID của giỏ hàng hiện tại
let authToken = null; // Token xác thực

function submitSignupForm() {
  const firstname = document.getElementById("firstname");
  const lastname = document.getElementById("lastname");
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const errorMessage = document.getElementById("signup-error-message");

  if (!firstname.value || !lastname.value || !email.value || !password.value) {
    errorMessage.textContent = "Bạn chưa điền đầy đủ thông tin!";
    return;
  }

  const data = {
    firstname: firstname.value,
    lastname: lastname.value,
    email: email.value,
    password: password.value,
  };

  fetch("http://localhost:9999/auth/sign-up", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      alert("Đăng ký thành công!");
      window.location.href = "signin.html";
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Đăng ký thất bại!");
    });
}

function submitSigninForm() {
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const errorMessage = document.getElementById("signin-error-message");

  if (!email.value || !password.value) {
    errorMessage.textContent = "Bạn chưa điền đầy đủ thông tin!";
    return;
  }

  const data = {
    email: email.value,
    password: password.value,
  };

  fetch("http://localhost:9999/auth/sign-in", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      isLoggedIn = true;
      authToken = data.token; // Lưu token sau khi đăng nhập
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userRole", data.role);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("userEmail", data.email);
      if (data.role === "ADMIN") {
        window.location.href = "admin.html";
      } else {
        window.location.href = "user.html";
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      errorMessage.textContent = "Sai tài khoản hoặc mật khẩu!";
    });
}

function submitCheckoutForm() {
  const doorNumber = document.getElementById("doorNumber");
  const street = document.getElementById("street");
  const city = document.getElementById("city");
  const district = document.getElementById("district");
  const errorMessage = document.getElementById("checkout-error-message");
  const successMessage = document.getElementById("success-message");

  if (!doorNumber.value || !street.value || !city.value || !district.value) {
    errorMessage.textContent = "Bạn chưa điền đầy đủ thông tin!";
    return;
  }

  const data = {
    doorNumber: doorNumber.value,
    street: street.value,
    city: city.value,
    district: district.value,
  };

  fetch("http://localhost:9999/cart/create?user_id=3", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((cartData) => {
      currentCartId = cartData.id; // Lưu ID của giỏ hàng hiện tại
      fetch("http://localhost:9999/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(data),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          successMessage.style.display = "block";
        })
        .catch((error) => {
          console.error("Error:", error);
          errorMessage.textContent = "Thanh toán thất bại!";
        });
    })
    .catch((error) => {
      console.error("Error:", error);
      errorMessage.textContent = "Tạo giỏ hàng thất bại!";
    });
}

function addToCart(productId) {
  if (!isLoggedIn) {
    window.location.href = "signin.html";
    return;
  }

  const quantity = prompt("Nhập số lượng sản phẩm:");

  if (!quantity) {
    alert("Bạn chưa nhập số lượng sản phẩm!");
    return;
  }

  fetch(
    `http://localhost:9999/cart/add/items?cartId=${currentCartId}&productId=${productId}&quantity=${quantity}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      alert(`Sản phẩm ${productId} đã được thêm vào giỏ hàng!`);
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Thêm sản phẩm vào giỏ hàng thất bại!");
    });
}

function checkout() {
  window.location.href = "checkout.html";
}

function submitCategoryForm() {
  const categoryName = document.getElementById("category-name");
  const errorMessage = document.getElementById("category-error-message");

  if (!categoryName.value) {
    errorMessage.textContent = "Bạn chưa điền tên loại hàng!";
    return;
  }

  const data = {
    name: categoryName.value,
  };

  fetch("http://localhost:9999/admin/category/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      alert("Thêm loại hàng thành công!");
      loadCategories(); // Load lại danh sách loại hàng sau khi thêm
    })
    .catch((error) => {
      console.error("Error:", error);
      errorMessage.textContent = "Thêm loại hàng thất bại!";
    });
}

function submitRoleForm() {
  const email = document.getElementById("email");
  const newRole = document.getElementById("newRole");
  const errorMessage = document.getElementById("role-error-message");

  if (!email.value || !newRole.value) {
    errorMessage.textContent = "Bạn chưa điền đầy đủ thông tin!";
    return;
  }

  if (newRole.value !== "ADMIN") {
    errorMessage.textContent = "Vai trò mới chỉ có thể là ADMIN!";
    return;
  }

  const data = {
    email: email.value,
    newRole: newRole.value,
  };

  fetch("http://localhost:9999/admin/change-role", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      alert("Thay đổi vai trò thành công!");
    })
    .catch((error) => {
      console.error("Error:", error);
      errorMessage.textContent = "Thay đổi vai trò thất bại!";
    });
}

function submitProductForm() {
  const name = document.getElementById("name");
  const image = document.getElementById("image");
  const price = document.getElementById("price");
  const description = document.getElementById("description");
  const quantity = document.getElementById("quantity");
  const category = document.getElementById("category");
  const errorMessage = document.getElementById("product-error-message");

  if (
    !name.value ||
    !image.value ||
    !price.value ||
    !description.value ||
    !quantity.value ||
    !category.value
  ) {
    errorMessage.textContent = "Bạn chưa điền đầy đủ thông tin!";
    return;
  }

  const data = {
    name: name.value,
    image_1: image.value,
    price: parseFloat(price),
    description: description.value,
    quantity: parseInt(quantity),
  };

  fetch(
    `http://localhost:9999/admin/products/add?categoryId=${category.value}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(data),
    }
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      alert("Thêm sản phẩm thành công!");
      loadProducts(); // Load lại danh sách sản phẩm sau khi thêm
    })
    .catch((error) => {
      console.error("Error:", error);
      errorMessage.textContent = "Thêm sản phẩm thất bại!";
    });
}

function updateProduct(productId) {
  const name = prompt("Nhập tên sản phẩm mới:");
  const description = prompt("Nhập mô tả sản phẩm mới:");
  const price = prompt("Nhập giá sản phẩm mới:");
  const quantity = prompt("Nhập số lượng sản phẩm mới:");

  if (!name || !description || !price || !quantity) {
    alert("Bạn chưa điền đầy đủ thông tin!");
    return;
  }

  const data = {
    id: productId,
    name: name,
    description: description,
    price: parseFloat(price),
    quantity: parseInt(quantity),
  };

  fetch("http://localhost:9999/admin/products/update", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      alert("Cập nhật sản phẩm thành công!");
      loadProducts(); // Load lại danh sách sản phẩm sau khi cập nhật
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Cập nhật sản phẩm thất bại!");
    });
}

function deleteProduct(productId) {
  fetch(`http://localhost:9999/admin/products/delete/${productId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      alert("Xóa sản phẩm thành công!");
      loadProducts(); // Load lại danh sách sản phẩm sau khi xóa
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Xóa sản phẩm thất bại!");
    });
}

function loadProducts() {
  fetch("http://localhost:9999/admin/products")
    .then((response) => response.json())
    .then((data) => {
      const productList = document.getElementById("product-list");
      productList.innerHTML = "";
      data.forEach((product) => {
        const productItem = document.createElement("div");
        productItem.className = "product-item";
        productItem.innerHTML = `
          <img src="${product.image}" alt="${product.name}" />
          <h3>${product.name}</h3>
          <p>Giá: $${product.price}</p>
          <button onclick="addToCart(${product.id})">Thêm vào giỏ hàng</button>
        `;
        productList.appendChild(productItem);
      });
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function loadCategories() {
  fetch("http://localhost:9999/admin/categories")
    .then((response) => response.json())
    .then((data) => {
      const categorySelect = document.getElementById("category");
      categorySelect.innerHTML = "";
      data.forEach((category) => {
        const option = document.createElement("option");
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
      });
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function loadShopCategories() {
  fetch("http://localhost:9999/admin/categories")
    .then((response) => response.json())
    .then((data) => {
      const categoryButtons = document.getElementById("category-buttons");
      categoryButtons.innerHTML = "";
      data.forEach((category) => {
        const button = document.createElement("button");
        button.textContent = category.name;
        button.onclick = () => filterProductsByCategory(category.id);
        categoryButtons.appendChild(button);
      });
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function filterProductsByCategory(categoryId) {
  fetch(`http://localhost:9999/products?category=${categoryId}`)
    .then((response) => response.json())
    .then((data) => {
      const productList = document.getElementById("product-list");
      productList.innerHTML = "";
      data.forEach((product) => {
        const productItem = document.createElement("div");
        productItem.className = "product-item";
        productItem.innerHTML = `
          <img src="${product.image}" alt="${product.name}" />
          <h3>${product.name}</h3>
          <p>Giá: $${product.price}</p>
          <button onclick="addToCart(${product.id})">Thêm vào giỏ hàng</button>
        `;
        productList.appendChild(productItem);
      });
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function redirectToShop() {
  window.location.href = "shop.html";
}

function searchProducts() {
  const searchInput = document.getElementById("search-input").value;
  alert(`Tìm kiếm sản phẩm: ${searchInput}`);
}

function logout() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userId");
  localStorage.removeItem("userEmail");
  window.location.href = "signin.html";
}

function checkAdminAccess() {
  const userRole = localStorage.getItem("userRole");
  if (userRole !== "ADMIN") {
    alert("Bạn không có quyền truy cập trang này!");
    window.location.href = "signin.html";
  }
}

// Load danh sách sản phẩm và danh mục khi trang admin được tải
document.addEventListener("DOMContentLoaded", () => {
  const currentPath = window.location.pathname;
  if (currentPath.includes("admin.html")) {
    checkAdminAccess();
    loadProducts();
    loadCategories();
  } else if (currentPath.includes("user.html")) {
    loadShopCategories();
  }
});
