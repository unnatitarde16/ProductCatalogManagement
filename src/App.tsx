import { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  Package,
  LayoutDashboard,
  LogOut,
  Plus,
  BarChart3,
  Settings as SettingsIcon,
  UserCircle,
  Eye,
  Edit,
  Trash2,
  Search,
  Grid2X2,
  Table2,
  Menu,
  X,
  Moon,
  Sun,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import api from "./api";

const C = [
  "Electronics",
  "Clothing",
  "Shoes",
  "Beauty",
  "Home",
  "Books",
  "Sports",
  "Grocery",
  "Other",
];

const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const isAdmin = () => getUser()?.role === "ADMIN";

function Guard({
  children,
  onlyAdmin = false,
}: {
  children: any;
  onlyAdmin?: boolean;
}) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (onlyAdmin && !isAdmin()) {
    return <Navigate to="/products" replace />;
  }

  return <>{children}</>;
}

function Layout({ children }: { children: any }) {
  const u = getUser();

  const [open, setOpen] = useState(false);

  const [dark, setDark] = useState(
    localStorage.getItem("theme") === "dark"
  );

  /*
   * IMPORTANT FIX:
   *
   * Do NOT write:
   *
   * useEffect(() =>
   *   document.documentElement.classList.toggle("dark", dark),
   *   [dark]
   * );
   *
   * classList.toggle() returns true/false.
   * React expects useEffect to return nothing
   * or a cleanup function.
   */

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const nav = useNavigate();

  const links = [
    ["/", "Dashboard", LayoutDashboard],
    ["/products", "Products", Package],

    ...(u?.role === "ADMIN"
      ? [
          ["/add", "Add Product", Plus],
          ["/analytics", "Analytics", BarChart3],
        ]
      : []),

    ["/profile", "Profile", UserCircle],
    ["/settings", "Settings", SettingsIcon],
  ] as any[];

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    nav("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 dark:text-white">
      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 border-r bg-white p-4 dark:bg-slate-900 ${
          open ? "block" : "hidden"
        } lg:block`}
      >
        <div className="flex items-center gap-2 p-2 text-xl font-bold">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--accent)] text-white">
            <Package />
          </span>

          Catalog

          <button
            className="ml-auto lg:hidden"
            onClick={() => setOpen(false)}
          >
            <X />
          </button>
        </div>

        <nav className="mt-6 space-y-1">
          {links.map(([to, n, I]) => (
            <Link
              onClick={() => setOpen(false)}
              key={to}
              to={to}
              className="flex items-center gap-3 rounded-xl p-3 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <I size={18} />
              {n}
            </Link>
          ))}
        </nav>

        <button
          className="absolute bottom-5 left-5 flex items-center gap-2 text-sm"
          onClick={logout}
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      {/* MAIN */}
      <main className="lg:pl-64">
        {/* HEADER */}
        <header className="sticky top-0 z-20 flex h-16 items-center border-b bg-white/90 px-4 backdrop-blur dark:bg-slate-900/90">
          <button
            className="mr-3 lg:hidden"
            onClick={() => setOpen(true)}
          >
            <Menu />
          </button>

          <div className="flex-1 font-bold">
            Product Catalog Management
          </div>

          <button
            onClick={() => {
              const newDark = !dark;
              setDark(newDark);
              localStorage.setItem(
                "theme",
                newDark ? "dark" : "light"
              );
            }}
            className="p-2"
          >
            {dark ? <Sun /> : <Moon />}
          </button>

          <span className="ml-3 hidden text-sm sm:block">
            {u?.name} · {u?.role}
          </span>
        </header>

        {/* PAGE CONTENT */}
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}

/* =========================================================
   LOGIN
========================================================= */

function Login() {
  const nav = useNavigate();

  const [e, setE] = useState("admin@example.com");
  const [p, setP] = useState("Admin@12345");
  const [err, setErr] = useState("");

  const go = async (x: any) => {
    x.preventDefault();

    setErr("");

    try {
      const r = await api.post("/auth/login", {
        email: e,
        password: p,
      });

      localStorage.setItem("token", r.data.data.token);

      localStorage.setItem(
        "user",
        JSON.stringify(r.data.data.user)
      );

      nav("/");
    } catch (x: any) {
      setErr(
        x.response?.data?.message || "Login failed"
      );
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-violet-100 to-indigo-100 p-4 dark:from-slate-950 dark:to-indigo-950">
      <form
        onSubmit={go}
        className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl dark:bg-slate-900"
      >
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-[var(--accent)] text-white">
            <Package />
          </div>

          <h1 className="text-2xl font-bold">
            Product Catalog Management
          </h1>

          <p className="text-sm text-slate-500">
            Login to continue
          </p>
        </div>

        {err && (
          <p className="mb-3 rounded-xl bg-red-50 p-3 text-red-600">
            {err}
          </p>
        )}

        <label className="label">
          Email

          <input
            className="input"
            type="email"
            value={e}
            onChange={(x) => setE(x.target.value)}
            required
          />
        </label>

        <label className="label">
          Password

          <input
            className="input"
            type="password"
            value={p}
            onChange={(x) => setP(x.target.value)}
            required
          />
        </label>

        <button className="btn w-full">
          Login
        </button>

        <p className="mt-4 text-center text-sm">
          No account?{" "}
          <Link
            className="text-[var(--accent)]"
            to="/register"
          >
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}

/* =========================================================
   REGISTER
========================================================= */

function Register() {
  const nav = useNavigate();

  const [f, setF] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });

  const [err, setErr] = useState("");

  const go = async (e: any) => {
    e.preventDefault();

    setErr("");

    if (f.password !== f.confirm) {
      setErr("Passwords do not match");
      return;
    }

    try {
      const r = await api.post("/auth/register", {
        name: f.name,
        email: f.email,
        password: f.password,
      });

      localStorage.setItem(
        "token",
        r.data.data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(r.data.data.user)
      );

      nav("/");
    } catch (x: any) {
      setErr(
        x.response?.data?.message ||
          "Registration failed"
      );
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-slate-100 p-4 dark:bg-slate-950">
      <form
        onSubmit={go}
        className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl dark:bg-slate-900"
      >
        <h1 className="mb-6 text-2xl font-bold">
          Create account
        </h1>

        {err && (
          <p className="mb-3 text-red-600">
            {err}
          </p>
        )}

        {[
          ["name", "Name"],
          ["email", "Email"],
          ["password", "Password"],
          ["confirm", "Confirm Password"],
        ].map(([k, label]) => (
          <label className="label" key={k}>
            {label}

            <input
              className="input"
              required
              type={
                k === "email"
                  ? "email"
                  : k === "password" ||
                    k === "confirm"
                  ? "password"
                  : "text"
              }
              value={(f as any)[k]}
              onChange={(e) =>
                setF({
                  ...f,
                  [k]: e.target.value,
                })
              }
            />
          </label>
        ))}

        <p className="mb-4 text-xs text-slate-500">
          Registration always creates USER.
          ADMIN is backend-controlled.
        </p>

        <button className="btn w-full">
          Register
        </button>
      </form>
    </div>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard() {
  const [a, setA] = useState<any>();

  useEffect(() => {
    api
      .get("/products/analytics")
      .then((r) => setA(r.data.data))
      .catch(() => {});
  }, []);

  if (!isAdmin()) {
    return <Products />;
  }

  if (!a) {
    return <div>Loading...</div>;
  }

  const s = a.summary;

  return (
    <>
      <h2 className="title">Dashboard</h2>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ["Total Products", s.totalProducts],
          ["Active Products", s.activeProducts],
          ["Inactive Products", s.inactiveProducts],
          ["Low Stock", s.lowStockProducts],
          ["Total Stock", s.totalStock],
        ].map((x) => (
          <div
            className="card"
            key={x[0] as string}
          >
            <p className="text-sm text-slate-500">
              {x[0]}
            </p>

            <b className="mt-2 block text-2xl">
              {x[1]}
            </b>
          </div>
        ))}
      </div>

      <div className="card mt-6">
        <h3 className="font-bold">
          Products by Category
        </h3>

        <div className="h-80">
          <ResponsiveContainer>
            <BarChart data={a.byCategory}>
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="count"
                fill="var(--accent)"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}

/* =========================================================
   PRODUCTS
========================================================= */

function Products() {
  const [items, setItems] = useState<any[]>([]);

  const [pg, setPg] = useState<any>({
    page: 1,
    limit: 10,
    totalProducts: 0,
    totalPages: 0,
  });

  const [q, setQ] = useState<any>({
    search: "",
    category: "All",
    status: "All",
    minPrice: "",
    maxPrice: "",
    sort: "newest",
  });

  const [grid, setGrid] = useState(false);

  const load = (page = 1) => {
    api
      .get("/products", {
        params: {
          ...q,
          page,
          limit: pg.limit,
        },
      })
      .then((r) => {
        setItems(r.data.data);
        setPg(r.data.pagination);
      })
      .catch(() => {
        setItems([]);
      });
  };

  useEffect(() => {
    const t = setTimeout(() => {
      load(1);
    }, 300);

    return () => clearTimeout(t);
  }, [q, pg.limit]);

  const del = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this product?"
      )
    ) {
      return;
    }

    try {
      await api.delete("/products/" + id);
      load(pg.page);
    } catch (error) {
      alert("Unable to delete product");
    }
  };

  return (
    <>
      <div className="mb-5 flex flex-wrap justify-between gap-3">
        <div>
          <h2 className="title">Products</h2>

          <p className="text-sm text-slate-500">
            {pg.totalProducts} products in MongoDB
          </p>
        </div>

        {isAdmin() && (
          <Link
            className="btn inline-flex gap-2"
            to="/add"
          >
            <Plus size={18} />
            Add Product
          </Link>
        )}
      </div>

      {/* FILTERS */}

      <div className="card mb-5 grid gap-3 md:grid-cols-6">
        <div className="relative md:col-span-2">
          <Search
            className="absolute left-3 top-3 text-slate-400"
            size={18}
          />

          <input
            className="input pl-10"
            placeholder="Search name, category, brand"
            value={q.search}
            onChange={(e) =>
              setQ({
                ...q,
                search: e.target.value,
              })
            }
          />
        </div>

        <select
          className="input"
          value={q.category}
          onChange={(e) =>
            setQ({
              ...q,
              category: e.target.value,
            })
          }
        >
          <option>All</option>

          {C.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <select
          className="input"
          value={q.status}
          onChange={(e) =>
            setQ({
              ...q,
              status: e.target.value,
            })
          }
        >
          <option>All</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>

        <input
          className="input"
          placeholder="Min price"
          value={q.minPrice}
          onChange={(e) =>
            setQ({
              ...q,
              minPrice: e.target.value,
            })
          }
        />

        <input
          className="input"
          placeholder="Max price"
          value={q.maxPrice}
          onChange={(e) =>
            setQ({
              ...q,
              maxPrice: e.target.value,
            })
          }
        />

        <select
          className="input"
          value={q.sort}
          onChange={(e) =>
            setQ({
              ...q,
              sort: e.target.value,
            })
          }
        >
          <option value="newest">Newest</option>
          <option value="price_asc">
            Price ↑
          </option>
          <option value="price_desc">
            Price ↓
          </option>
        </select>
      </div>

      {/* VIEW SWITCH */}

      <div className="mb-3 flex justify-end gap-2">
        <button
          className="iconbtn"
          onClick={() => setGrid(false)}
        >
          <Table2 />
        </button>

        <button
          className="iconbtn"
          onClick={() => setGrid(true)}
        >
          <Grid2X2 />
        </button>
      </div>

      {/* GRID VIEW */}

      {grid ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((x) => (
            <div
              className="card overflow-hidden p-0"
              key={x._id}
            >
              <img
                src={
                  x.image ||
                  "https://placehold.co/600x400"
                }
                className="h-44 w-full object-cover"
              />

              <div className="p-4">
                <p className="text-xs text-slate-500">
                  {x.category} · {x.brand}
                </p>

                <h3 className="font-bold">
                  {x.name}
                </h3>

                <div className="mt-2 flex justify-between">
                  <b>
                    ₹
                    {Number(
                      x.price
                    ).toLocaleString("en-IN")}
                  </b>

                  <span>
                    ★ {x.rating}
                  </span>
                </div>

                <Link
                  className="btn mt-4 block text-center"
                  to={"/products/" + x._id}
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */

        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="p-3">Image</th>
                <th className="p-3">Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Brand</th>
                <th className="p-3">Price</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Rating</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {items.map((x) => (
                <tr
                  className="border-b"
                  key={x._id}
                >
                  <td className="p-3">
                    <img
                      src={
                        x.image ||
                        "https://placehold.co/100x100"
                      }
                      className="h-11 w-11 rounded object-cover"
                    />
                  </td>

                  <td className="p-3 font-semibold">
                    {x.name}
                  </td>

                  <td className="p-3">
                    {x.category}
                  </td>

                  <td className="p-3">
                    {x.brand}
                  </td>

                  <td className="p-3">
                    ₹
                    {Number(
                      x.price
                    ).toLocaleString("en-IN")}
                  </td>

                  <td className="p-3">
                    {x.stock}
                  </td>

                  <td className="p-3">
                    ★ {x.rating}
                  </td>

                  <td className="p-3">
                    {x.status}
                  </td>

                  <td className="p-3">
                    <div className="flex gap-1">
                      <Link
                        className="iconbtn"
                        to={
                          "/products/" +
                          x._id
                        }
                      >
                        <Eye size={16} />
                      </Link>

                      {isAdmin() && (
                        <>
                          <Link
                            className="iconbtn"
                            to={
                              "/edit/" +
                              x._id
                            }
                          >
                            <Edit size={16} />
                          </Link>

                          <button
                            className="iconbtn text-red-600"
                            onClick={() =>
                              del(x._id)
                            }
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!items.length && (
            <p className="p-10 text-center text-slate-500">
              No products found
            </p>
          )}
        </div>
      )}

      {/* PAGINATION */}

      <div className="mt-4 flex justify-between gap-3">
        <select
          className="input w-auto"
          value={pg.limit}
          onChange={(e) =>
            setPg({
              ...pg,
              limit: +e.target.value,
              page: 1,
            })
          }
        >
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>

        <div className="flex items-center gap-2">
          <button
            className="btn-secondary"
            disabled={pg.page <= 1}
            onClick={() =>
              load(pg.page - 1)
            }
          >
            Previous
          </button>

          <span>
            Page {pg.page} of{" "}
            {pg.totalPages || 1}
          </span>

          <button
            className="btn-secondary"
            disabled={
              pg.page >= pg.totalPages
            }
            onClick={() =>
              load(pg.page + 1)
            }
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}

/* =========================================================
   ADD / EDIT PRODUCT
========================================================= */

function Form() {
  const { id } = useParams();
  const nav = useNavigate();

  const edit = !!id;

  const [f, setF] = useState<any>({
    name: "",
    description: "",
    category: C[0],
    brand: "",
    price: "",
    stock: "",
    rating: "0",
    image: "",
    status: "Active",
  });

  useEffect(() => {
    if (id) {
      api
        .get("/products/" + id)
        .then((r) => setF(r.data.data))
        .catch(() => alert("Unable to load product"));
    }
  }, [id]);

  const save = async (e: any) => {
    e.preventDefault();

    const d = {
      ...f,
      price: +f.price,
      stock: +f.stock,
      rating: +f.rating,
    };

    if (
      !f.name ||
      !f.description ||
      !f.category ||
      d.price <= 0 ||
      d.stock < 0 ||
      d.rating < 0 ||
      d.rating > 5
    ) {
      alert("Please enter valid product values");
      return;
    }

    try {
      if (edit) {
        await api.put(
          "/products/" + id,
          d
        );
        alert("Product updated successfully");
      } else {
        await api.post(
          "/products",
          d
        );
        alert("Product created successfully");
      }

      nav("/products");
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          "Unable to save product"
      );
    }
  };

  return (
    <>
      <h2 className="title">
        {edit ? "Edit" : "Add"} Product
      </h2>

      <form
        className="card grid gap-4 md:grid-cols-2"
        onSubmit={save}
      >
        {[
          ["name", "Product Name"],
          ["brand", "Brand"],
          ["price", "Price"],
          ["stock", "Stock"],
          ["rating", "Rating"],
          ["image", "Image URL"],
        ].map(([k, l]) => (
          <label
            className="label"
            key={k}
          >
            {l}

            <input
              className="input"
              required={
                ["name", "price", "stock"].includes(
                  k
                )
              }
              type={
                ["price", "stock", "rating"].includes(
                  k
                )
                  ? "number"
                  : "text"
              }
              min={
                k === "price" || k === "stock"
                  ? "0"
                  : k === "rating"
                  ? "0"
                  : undefined
              }
              max={
                k === "rating"
                  ? "5"
                  : undefined
              }
              value={f[k] ?? ""}
              onChange={(e) =>
                setF({
                  ...f,
                  [k]: e.target.value,
                })
              }
            />
          </label>
        ))}

        <label className="label">
          Category

          <select
            className="input"
            value={f.category}
            onChange={(e) =>
              setF({
                ...f,
                category: e.target.value,
              })
            }
          >
            {C.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>

        <label className="label">
          Status

          <select
            className="input"
            value={f.status}
            onChange={(e) =>
              setF({
                ...f,
                status: e.target.value,
              })
            }
          >
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </label>

        <label className="label md:col-span-2">
          Description

          <textarea
            className="input min-h-32"
            required
            value={f.description}
            onChange={(e) =>
              setF({
                ...f,
                description: e.target.value,
              })
            }
          />
        </label>

        <div>
          <button className="btn">
            {edit
              ? "Save Changes"
              : "Create Product"}
          </button>

          {" "}

          <button
            type="button"
            className="btn-secondary"
            onClick={() =>
              nav("/products")
            }
          >
            Cancel
          </button>
        </div>
      </form>
    </>
  );
}

/* =========================================================
   PRODUCT DETAILS
========================================================= */

function Details() {
  const { id } = useParams();

  const [p, setP] = useState<any>();

  useEffect(() => {
    api
      .get("/products/" + id)
      .then((r) => setP(r.data.data))
      .catch(() => {});
  }, [id]);

  if (!p) {
    return <div>Loading...</div>;
  }

  return (
    <div className="card max-w-4xl grid gap-6 md:grid-cols-2">
      <img
        src={
          p.image ||
          "https://placehold.co/800x600"
        }
        className="h-96 w-full rounded-2xl object-cover"
      />

      <div>
        <span className="badge">
          {p.category}
        </span>

        <h2 className="mt-3 text-3xl font-bold">
          {p.name}
        </h2>

        <p className="my-4 text-slate-500">
          {p.description}
        </p>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <b>
            Brand
            <br />
            {p.brand}
          </b>

          <b>
            Price
            <br />₹
            {Number(
              p.price
            ).toLocaleString("en-IN")}
          </b>

          <b>
            Stock
            <br />
            {p.stock}
          </b>

          <b>
            Rating
            <br />
            ★ {p.rating}
          </b>

          <b>
            Status
            <br />
            {p.status}
          </b>

          <b>
            Created
            <br />
            {new Date(
              p.createdAt
            ).toLocaleDateString()}
          </b>

          <b>
            Updated
            <br />
            {new Date(
              p.updatedAt
            ).toLocaleDateString()}
          </b>
        </div>

        {isAdmin() && (
          <Link
            className="btn mt-6 inline-block"
            to={"/edit/" + p._id}
          >
            Edit Product
          </Link>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   ANALYTICS
========================================================= */

function Analytics() {
  const [a, setA] = useState<any>();

  useEffect(() => {
    api
      .get("/products/analytics")
      .then((r) => setA(r.data.data))
      .catch(() => {});
  }, []);

  if (!a) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <h2 className="title">
        Analytics
      </h2>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="font-bold">
            Products by Brand
          </h3>

          <div className="h-80">
            <ResponsiveContainer>
              <BarChart data={a.byBrand}>
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />

                <Bar
                  dataKey="count"
                  fill="var(--accent)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold">
            Stock by Category
          </h3>

          <div className="h-80">
            <ResponsiveContainer>
              <BarChart data={a.byCategory}>
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />

                <Bar
                  dataKey="totalStock"
                  fill="var(--accent)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
}

/* =========================================================
   SIMPLE PAGES
========================================================= */

function Simple({
  title,
}: {
  title: string;
}) {
  return (
    <>
      <h2 className="title">
        {title}
      </h2>

      <div className="card">
        <p className="text-slate-500">
          {title} section is available in
          the application. Appearance
          settings are stored in localStorage.
        </p>
      </div>
    </>
  );
}

/* =========================================================
   APP ROUTES
========================================================= */

export default function App() {
  return (
    <Routes>
      {/* PUBLIC ROUTES */}

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      {/* PROTECTED ROUTES */}

      <Route
        path="*"
        element={
          <Guard>
            <Layout>
              <Routes>
                <Route
                  path="/"
                  element={<Dashboard />}
                />

                <Route
                  path="/products"
                  element={<Products />}
                />

                <Route
                  path="/products/:id"
                  element={<Details />}
                />

                <Route
                  path="/add"
                  element={
                    <Guard onlyAdmin>
                      <Form />
                    </Guard>
                  }
                />

                <Route
                  path="/edit/:id"
                  element={
                    <Guard onlyAdmin>
                      <Form />
                    </Guard>
                  }
                />

                <Route
                  path="/analytics"
                  element={
                    <Guard onlyAdmin>
                      <Analytics />
                    </Guard>
                  }
                />

                <Route
                  path="/profile"
                  element={
                    <Simple title="Profile" />
                  }
                />

                <Route
                  path="/settings"
                  element={
                    <Simple title="Settings" />
                  }
                />

                <Route
                  path="*"
                  element={
                    <Navigate
                      to="/"
                      replace
                    />
                  }
                />
              </Routes>
            </Layout>
          </Guard>
        }
      />
    </Routes>
  );
}