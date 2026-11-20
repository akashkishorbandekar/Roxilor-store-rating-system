
import { useEffect, useState } from "react";
import {
  Users,
  Store,
  Star,
  LogOut,
  Search,
  Plus,
  X,
  ShieldCheck,
  MapPin,
  Mail,
  RefreshCw,
  Trash2,
  Eye,
  ArrowUpRight,
  Activity,
  ChevronDown,
  SlidersHorizontal,
  LayoutDashboard,
  Building2,
  UserRound,
  TrendingUp,
  Menu,
  CalendarDays,
  CircleCheck,
  ArrowDownUp
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState("Dashboard");
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(false);

  const [userFilters, setUserFilters] = useState({
    name: "",
    email: "",
    address: "",
    role: ""
  });

  const [storeFilters, setStoreFilters] = useState({
    name: "",
    email: "",
    address: ""
  });

  const [userSortBy, setUserSortBy] = useState("name");
  const [userOrder, setUserOrder] = useState("ASC");
  const [storeSortBy, setStoreSortBy] = useState("name");
  const [storeOrder, setStoreOrder] = useState("ASC");
  const [ratingSortBy, setRatingSortBy] = useState("ratingDate");
  const [ratingOrder, setRatingOrder] = useState("DESC");

  const [showUserForm, setShowUserForm] = useState(false);
  const [showStoreForm, setShowStoreForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    role: "user"
  });

  const [storeForm, setStoreForm] = useState({
    name: "",
    email: "",
    address: "",
    owner_id: ""
  });

  const clearMessages = () => {
    setMessage("");
    setError("");
  };

  const loadDashboard = async () => {
    try {
      const response = await api.get("/admin/dashboard");
      setStats(response.data.statistics || {});
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load dashboard.");
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/users", {
        params: {
          name: userFilters.name || undefined,
          email: userFilters.email || undefined,
          address: userFilters.address || undefined,
          role: userFilters.role || undefined,
          sortBy: userSortBy,
          order: userOrder
        }
      });
      setUsers(response.data.users || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load users.");
    } finally {
      setLoading(false);
    }
  };

  const loadStores = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/stores", {
        params: {
          name: storeFilters.name || undefined,
          email: storeFilters.email || undefined,
          address: storeFilters.address || undefined,
          sortBy: storeSortBy,
          order: storeOrder
        }
      });
      setStores(response.data.stores || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load stores.");
    } finally {
      setLoading(false);
    }
  };

  const loadRatings = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/ratings");
      setRatings(response.data.ratings || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load ratings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    if (activeTab === "User Management") loadUsers();
    if (activeTab === "Store Management") loadStores();
    if (activeTab === "Ratings") loadRatings();
  }, [
    activeTab,
    userFilters,
    storeFilters,
    userSortBy,
    userOrder,
    storeSortBy,
    storeOrder
  ]);

  const changeTab = (tab) => {
    setActiveTab(tab);
    setMobileMenu(false);
    setUserFilters({ name: "", email: "", address: "", role: "" });
    setStoreFilters({ name: "", email: "", address: "" });
    setUserSortBy("name");
    setUserOrder("ASC");
    setStoreSortBy("name");
    setStoreOrder("ASC");
    setRatingSortBy("ratingDate");
    setRatingOrder("DESC");
    setSelectedUser(null);
    clearMessages();
  };

  const changeSort = (field, currentField, setField, setOrder) => {
    if (currentField === field) {
      setOrder((previous) => previous === "ASC" ? "DESC" : "ASC");
    } else {
      setField(field);
      setOrder("ASC");
    }
  };

  const changeUserSort = (field) =>
    changeSort(field, userSortBy, setUserSortBy, setUserOrder);

  const changeStoreSort = (field) =>
    changeSort(field, storeSortBy, setStoreSortBy, setStoreOrder);

  const changeRatingSort = (field) =>
    changeSort(field, ratingSortBy, setRatingSortBy, setRatingOrder);

  const sortedRatings = [...ratings].sort((a, b) => {
    let valueA = a[ratingSortBy];
    let valueB = b[ratingSortBy];

    if (ratingSortBy === "rating") {
      valueA = Number(valueA || 0);
      valueB = Number(valueB || 0);
    } else if (ratingSortBy === "ratingDate") {
      valueA = valueA ? new Date(valueA).getTime() : 0;
      valueB = valueB ? new Date(valueB).getTime() : 0;
    } else {
      valueA = String(valueA || "").toLowerCase();
      valueB = String(valueB || "").toLowerCase();
    }

    if (valueA < valueB) return ratingOrder === "ASC" ? -1 : 1;
    if (valueA > valueB) return ratingOrder === "ASC" ? 1 : -1;
    return 0;
  });

  const handleCreateUser = async (e) => {
    e.preventDefault();
    clearMessages();

    try {
      await api.post("/admin/users", userForm);
      setMessage("User created successfully.");

      setUserForm({
        name: "",
        email: "",
        password: "",
        address: "",
        role: "user"
      });

      setShowUserForm(false);
      await loadDashboard();

      if (activeTab === "User Management") await loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create user.");
    }
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();
    clearMessages();

    try {
      const payload = {
        name: storeForm.name,
        email: storeForm.email,
        address: storeForm.address,
        owner_id: storeForm.owner_id ? Number(storeForm.owner_id) : null
      };

      await api.post("/admin/stores", payload);
      setMessage("Store created successfully.");

      setStoreForm({
        name: "",
        email: "",
        address: "",
        owner_id: ""
      });

      setShowStoreForm(false);
      await loadDashboard();

      if (activeTab === "Store Management") await loadStores();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create store.");
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (Number(id) === Number(user?.id)) {
      setError("You cannot remove your own administrator account.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to remove ${name}? This action cannot be undone.`
    );

    if (!confirmed) return;

    clearMessages();

    try {
      const response = await api.delete(`/admin/users/${id}`);
      setMessage(response.data.message || "User removed successfully.");

      if (Number(selectedUser?.id) === Number(id)) {
        setSelectedUser(null);
      }

      await loadUsers();
      await loadDashboard();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to remove user.");
    }
  };

  const handleDeleteStore = async (id, name) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove ${name}? Its ratings will also be deleted.`
    );

    if (!confirmed) return;

    clearMessages();

    try {
      const response = await api.delete(`/admin/stores/${id}`);
      setMessage(response.data.message || "Store removed successfully.");
      await loadStores();
      await loadDashboard();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to remove store.");
    }
  };

  const roleLabel = (role) => {
    if (role === "store_owner") return "Store Owner";
    if (role === "admin") return "Administrator";
    return "Customer";
  };

  const sortLabel = (field, currentField, order) =>
    currentField === field ? (order === "ASC" ? " ↑" : " ↓") : "";

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, number: "01" },
    { label: "User Management", icon: Users, number: "02" },
    { label: "Store Management", icon: Building2, number: "03" },
    { label: "Ratings", icon: Star, number: "04" }
  ];

  const metrics = [
    {
      label: "Total accounts",
      value: stats.totalUsers ?? 0,
      note: "Registered platform users",
      icon: Users,
      color: "violet"
    },
    {
      label: "Registered stores",
      value: stats.totalStores ?? 0,
      note: "Businesses on the platform",
      icon: Store,
      color: "cyan"
    },
    {
      label: "Ratings received",
      value: stats.totalRatings ?? 0,
      note: "Customer feedback entries",
      icon: Star,
      color: "lime"
    },
    {
      label: "Administrators",
      value: stats.totalAdmins ?? 0,
      note: "Privileged accounts",
      icon: ShieldCheck,
      color: "orange"
    }
  ];

  const accountTotal = Number(stats.totalUsers || 0);
  const customerTotal = Number(stats.totalNormalUsers || 0);
  const ownerTotal = Number(stats.totalStoreOwners || 0);
  const adminTotal = Number(stats.totalAdmins || 0);

  const customerPercent = accountTotal ? customerTotal / accountTotal * 100 : 0;
  const ownerPercent = accountTotal ? ownerTotal / accountTotal * 100 : 0;
  const adminPercent = accountTotal ? adminTotal / accountTotal * 100 : 0;

  return (
    <div className="command-shell">
      <header className="command-topbar">
        <div className="command-brand">
          <div className="command-brand-symbol">
            <Activity size={22} />
          </div>
          <div>
            <strong>ROXILOR<span>/</span></strong>
            <small>PLATFORM CONTROL</small>
          </div>
        </div>

        <nav className={`command-nav ${mobileMenu ? "open" : ""}`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                type="button"
                key={item.label}
                className={activeTab === item.label ? "active" : ""}
                onClick={() => changeTab(item.label)}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="command-top-actions">
          <span className="command-live">
            <i></i> LIVE
          </span>
          <div className="command-admin">
            <span className="command-admin-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
            <div>
              <strong>{user?.name}</strong>
              <small>System administrator</small>
            </div>
          </div>
          <button className="command-logout" type="button" onClick={logout}>
            <LogOut size={17} />
          </button>
          <button
            className="command-mobile-menu"
            type="button"
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            <Menu size={21} />
          </button>
        </div>
      </header>

      <main className="command-content">
        <div className="command-page-heading">
          <div>
            <div className="command-breadcrumb">
              ROXILOR <span>/</span> CONTROL CENTRE <span>/</span> {activeTab.toUpperCase()}
            </div>
            <h1>
              {activeTab === "Dashboard"
                ? "Platform intelligence"
                : activeTab === "User Management"
                  ? "Account directory"
                  : activeTab === "Store Management"
                    ? "Business registry"
                    : "Customer feedback"}
            </h1>
            <p>
              {activeTab === "Dashboard"
                ? "A real-time overview of your store rating ecosystem."
                : activeTab === "User Management"
                  ? "Manage identities, roles and platform access."
                  : activeTab === "Store Management"
                    ? "Monitor registered businesses and their performance."
                    : "Explore customer ratings across the platform."}
            </p>
          </div>

          <div className="command-date">
            <CalendarDays size={16} />
            ADMIN WORKSPACE
          </div>
        </div>

        {message && (
          <div className="command-alert success" role="status">
            <CircleCheck size={18} />
            {message}
            <button type="button" onClick={() => setMessage("")}><X size={17} /></button>
          </div>
        )}

        {error && (
          <div className="command-alert error" role="alert">
            <ShieldCheck size={18} />
            {error}
            <button type="button" onClick={() => setError("")}><X size={17} /></button>
          </div>
        )}

        {activeTab === "Dashboard" && (
          <section className="command-dashboard">
            <div className="command-hero">
              <div className="command-hero-copy">
                <span className="command-overline">SYSTEM OVERVIEW / 001</span>
                <h2>
                  Good day, {user?.name?.split(" ")[0] || "Administrator"}.
                </h2>
                <p>
                  Your platform at a glance. Monitor activity, manage access and
                  keep every store experience moving.
                </p>
                <button type="button" onClick={loadDashboard}>
                  <RefreshCw size={16} /> Synchronise data
                </button>
              </div>
              <div className="command-hero-art">
                <div className="command-art-ring ring-one"></div>
                <div className="command-art-ring ring-two"></div>
                <div className="command-art-core">
                  <Activity size={42} />
                </div>
                <span className="command-art-label">SYSTEM<br />HEALTHY</span>
              </div>
            </div>

            <div className="command-metrics">
              {metrics.map((metric, index) => {
                const Icon = metric.icon;
                return (
                  <article className={`command-metric ${metric.color}`} key={metric.label}>
                    <div className="command-metric-top">
                      <span>{String(index + 1).padStart(2, "0")} / METRIC</span>
                      <Icon size={19} />
                    </div>
                    <strong>{metric.value}</strong>
                    <div className="command-metric-bottom">
                      <span>{metric.label}</span>
                      <small>{metric.note}</small>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="command-dashboard-grid">
              <section className="command-panel command-composition">
                <div className="command-panel-heading">
                  <div>
                    <span className="command-overline">USER ANALYTICS / 002</span>
                    <h3>Who is on the platform?</h3>
                  </div>
                  <Users size={21} />
                </div>

                <div className="command-composition-total">
                  <strong>{accountTotal}</strong>
                  <span>total registered accounts</span>
                </div>

                <div className="command-composition-bar">
                  <span className="composition-customers" style={{ width: `${customerPercent}%` }}></span>
                  <span className="composition-owners" style={{ width: `${ownerPercent}%` }}></span>
                  <span className="composition-admins" style={{ width: `${adminPercent}%` }}></span>
                </div>

                <div className="command-composition-list">
                  <div><i className="composition-dot customers"></i><span>Customers</span><strong>{customerTotal}</strong></div>
                  <div><i className="composition-dot owners"></i><span>Store owners</span><strong>{ownerTotal}</strong></div>
                  <div><i className="composition-dot admins"></i><span>Administrators</span><strong>{adminTotal}</strong></div>
                </div>
              </section>

              <section className="command-panel command-activity">
                <div className="command-panel-heading">
                  <div>
                    <span className="command-overline">QUICK ACCESS / 003</span>
                    <h3>Choose an operation</h3>
                  </div>
                  <ArrowUpRight size={21} />
                </div>

                <button type="button" onClick={() => changeTab("User Management")}>
                  <span className="command-operation-number">01</span>
                  <span className="command-operation-icon"><UserRound size={20} /></span>
                  <span className="command-operation-copy">
                    <strong>Account management</strong>
                    <small>Create, inspect and manage user accounts</small>
                  </span>
                  <ArrowUpRight size={17} />
                </button>

                <button type="button" onClick={() => changeTab("Store Management")}>
                  <span className="command-operation-number">02</span>
                  <span className="command-operation-icon"><Building2 size={20} /></span>
                  <span className="command-operation-copy">
                    <strong>Business registry</strong>
                    <small>Register and maintain store information</small>
                  </span>
                  <ArrowUpRight size={17} />
                </button>

                <button type="button" onClick={() => changeTab("Ratings")}>
                  <span className="command-operation-number">03</span>
                  <span className="command-operation-icon"><Star size={20} /></span>
                  <span className="command-operation-copy">
                    <strong>Feedback monitoring</strong>
                    <small>Review customer ratings and activity</small>
                  </span>
                  <ArrowUpRight size={17} />
                </button>
              </section>
            </div>

            <div className="command-database-note">
              <span><i></i> DATABASE CONNECTED</span>
              <span>Statistics retrieved from your live database</span>
            </div>
          </section>
        )}

        {activeTab === "User Management" && (
          <section className="command-management">
            <div className="command-section-intro">
              <div>
                <span className="command-overline">DIRECTORY / 002</span>
                <h2>People & permissions</h2>
                <p>Every account, role and access record in one place.</p>
              </div>
              <button className="command-primary" type="button" onClick={() => setShowUserForm(true)}>
                <Plus size={17} /> Create account
              </button>
            </div>

            <div className="command-filter-box">
              <div className="command-filter-title">
                <SlidersHorizontal size={17} />
                <span>Refine directory</span>
              </div>
              <div className="command-filter-grid">
                <div className="command-search-field">
                  <Search size={16} />
                  <input
                    value={userFilters.name}
                    onChange={(e) => setUserFilters({ ...userFilters, name: e.target.value })}
                    placeholder="Name"
                  />
                </div>
                <div className="command-search-field">
                  <Mail size={16} />
                  <input
                    value={userFilters.email}
                    onChange={(e) => setUserFilters({ ...userFilters, email: e.target.value })}
                    placeholder="Email"
                  />
                </div>
                <div className="command-search-field">
                  <MapPin size={16} />
                  <input
                    value={userFilters.address}
                    onChange={(e) => setUserFilters({ ...userFilters, address: e.target.value })}
                    placeholder="Address"
                  />
                </div>
                <select
                  value={userFilters.role}
                  onChange={(e) => setUserFilters({ ...userFilters, role: e.target.value })}
                >
                  <option value="">Every role</option>
                  <option value="admin">Administrator</option>
                  <option value="user">Customer</option>
                  <option value="store_owner">Store Owner</option>
                </select>
              </div>
            </div>

            <div className="command-table-panel">
              <div className="command-table-heading">
                <div>
                  <span className="command-overline">ACCOUNT DATABASE</span>
                  <h3>Registered accounts <span>{users.length}</span></h3>
                </div>
                <span className="command-table-status"><i></i> LIVE RECORDS</span>
              </div>

              <div className="command-table-scroll">
                <table className="command-table">
                  <thead>
                    <tr>
                      <th onClick={() => changeUserSort("name")}>PERSON <ArrowDownUp size={13} />{sortLabel("name", userSortBy, userOrder)}</th>
                      <th onClick={() => changeUserSort("email")}>EMAIL <ArrowDownUp size={13} />{sortLabel("email", userSortBy, userOrder)}</th>
                      <th onClick={() => changeUserSort("address")}>ADDRESS <ArrowDownUp size={13} />{sortLabel("address", userSortBy, userOrder)}</th>
                      <th onClick={() => changeUserSort("role")}>ROLE <ArrowDownUp size={13} />{sortLabel("role", userSortBy, userOrder)}</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div className="command-person">
                            <span>{item.name?.charAt(0).toUpperCase()}</span>
                            <strong>{item.name}</strong>
                          </div>
                        </td>
                        <td>{item.email}</td>
                        <td>{item.address}</td>
                        <td><span className={`command-role ${item.role}`}>{roleLabel(item.role)}</span></td>
                        <td>
                          <div className="command-row-actions">
                            <button type="button" onClick={() => setSelectedUser(item)}><Eye size={15} /> View</button>
                            <button
                              type="button"
                              className="danger"
                              onClick={() => handleDeleteUser(item.id, item.name)}
                              disabled={loading || Number(item.id) === Number(user?.id)}
                            >
                              <Trash2 size={15} /> Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {loading && <tr><td colSpan="5" className="command-empty">Loading accounts...</td></tr>}
                    {!loading && users.length === 0 && <tr><td colSpan="5" className="command-empty">No accounts match these filters.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {activeTab === "Store Management" && (
          <section className="command-management">
            <div className="command-section-intro">
              <div>
                <span className="command-overline">BUSINESS DIRECTORY / 003</span>
                <h2>Registered businesses</h2>
                <p>Review store information, ownership and customer feedback.</p>
              </div>
              <button className="command-primary" type="button" onClick={() => setShowStoreForm(true)}>
                <Plus size={17} /> Register business
              </button>
            </div>

            <div className="command-filter-box">
              <div className="command-filter-title">
                <Search size={17} />
                <span>Find a business</span>
              </div>
              <div className="command-filter-grid store-filters">
                <div className="command-search-field">
                  <Search size={16} />
                  <input
                    value={storeFilters.name}
                    onChange={(e) => setStoreFilters({ ...storeFilters, name: e.target.value })}
                    placeholder="Store name"
                  />
                </div>
                <div className="command-search-field">
                  <Mail size={16} />
                  <input
                    value={storeFilters.email}
                    onChange={(e) => setStoreFilters({ ...storeFilters, email: e.target.value })}
                    placeholder="Store email"
                  />
                </div>
                <div className="command-search-field">
                  <MapPin size={16} />
                  <input
                    value={storeFilters.address}
                    onChange={(e) => setStoreFilters({ ...storeFilters, address: e.target.value })}
                    placeholder="Store location"
                  />
                </div>
              </div>
            </div>

            <div className="command-table-panel">
              <div className="command-table-heading">
                <div>
                  <span className="command-overline">BUSINESS DATABASE</span>
                  <h3>Store registry <span>{stores.length}</span></h3>
                </div>
                <span className="command-table-status"><i></i> LIVE RECORDS</span>
              </div>

              <div className="command-table-scroll">
                <table className="command-table">
                  <thead>
                    <tr>
                      <th onClick={() => changeStoreSort("name")}>BUSINESS <ArrowDownUp size={13} />{sortLabel("name", storeSortBy, storeOrder)}</th>
                      <th onClick={() => changeStoreSort("email")}>EMAIL <ArrowDownUp size={13} />{sortLabel("email", storeSortBy, storeOrder)}</th>
                      <th onClick={() => changeStoreSort("address")}>LOCATION <ArrowDownUp size={13} />{sortLabel("address", storeSortBy, storeOrder)}</th>
                      <th onClick={() => changeStoreSort("average_rating")}>AVERAGE <ArrowDownUp size={13} />{sortLabel("average_rating", storeSortBy, storeOrder)}</th>
                      <th>RATINGS</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stores.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div className="command-person">
                            <span className="store-symbol"><Store size={16} /></span>
                            <strong>{item.name}</strong>
                          </div>
                        </td>
                        <td>{item.email}</td>
                        <td><span className="command-location"><MapPin size={14} />{item.address}</span></td>
                        <td><span className="command-rating"><Star size={15} />{Number(item.average_rating || 0).toFixed(1)}</span></td>
                        <td>{item.total_ratings ?? 0}</td>
                        <td>
                          <button
                            className="command-remove"
                            type="button"
                            onClick={() => handleDeleteStore(item.id, item.name)}
                            disabled={loading}
                          >
                            <Trash2 size={15} /> Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                    {loading && <tr><td colSpan="6" className="command-empty">Loading stores...</td></tr>}
                    {!loading && stores.length === 0 && <tr><td colSpan="6" className="command-empty">No stores match these filters.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {activeTab === "Ratings" && (
          <section className="command-management">
            <div className="command-section-intro">
              <div>
                <span className="command-overline">FEEDBACK MONITOR / 004</span>
                <h2>The customer voice</h2>
                <p>All submitted store ratings, organised in one activity log.</p>
              </div>
              <button className="command-secondary" type="button" onClick={loadRatings}>
                <RefreshCw size={16} /> Refresh feedback
              </button>
            </div>

            <div className="command-rating-summary">
              <div>
                <span>SUBMITTED RATINGS</span>
                <strong>{ratings.length}</strong>
                <small>Total feedback entries</small>
              </div>
              <div className="command-rating-summary-icon"><Star size={30} /></div>
            </div>

            <div className="command-table-panel">
              <div className="command-table-heading">
                <div>
                  <span className="command-overline">CUSTOMER EXPERIENCE</span>
                  <h3>Rating activity <span>{ratings.length}</span></h3>
                </div>
                <span className="command-table-status"><i></i> FEEDBACK LOG</span>
              </div>

              <div className="command-table-scroll">
                <table className="command-table">
                  <thead>
                    <tr>
                      <th onClick={() => changeRatingSort("customerName")}>CUSTOMER <ArrowDownUp size={13} />{sortLabel("customerName", ratingSortBy, ratingOrder)}</th>
                      <th onClick={() => changeRatingSort("customerEmail")}>EMAIL <ArrowDownUp size={13} />{sortLabel("customerEmail", ratingSortBy, ratingOrder)}</th>
                      <th onClick={() => changeRatingSort("storeName")}>STORE <ArrowDownUp size={13} />{sortLabel("storeName", ratingSortBy, ratingOrder)}</th>
                      <th onClick={() => changeRatingSort("rating")}>RATING <ArrowDownUp size={13} />{sortLabel("rating", ratingSortBy, ratingOrder)}</th>
                      <th onClick={() => changeRatingSort("ratingDate")}>DATE <ArrowDownUp size={13} />{sortLabel("ratingDate", ratingSortBy, ratingOrder)}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedRatings.map((item) => (
                      <tr key={item.id}>
                        <td><strong>{item.customerName}</strong></td>
                        <td>{item.customerEmail}</td>
                        <td>{item.storeName}</td>
                        <td><span className="command-rating"><Star size={15} />{item.rating} / 5</span></td>
                        <td>{item.ratingDate ? new Date(item.ratingDate).toLocaleDateString() : "—"}</td>
                      </tr>
                    ))}
                    {loading && <tr><td colSpan="5" className="command-empty">Loading ratings...</td></tr>}
                    {!loading && ratings.length === 0 && <tr><td colSpan="5" className="command-empty">No customer ratings have been submitted yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </main>

      {selectedUser && (
        <div className="command-modal-backdrop" onClick={() => setSelectedUser(null)}>
          <div className="command-modal" onClick={(e) => e.stopPropagation()}>
            <div className="command-modal-heading">
              <div>
                <span className="command-overline">ACCOUNT RECORD</span>
                <h2>Account details</h2>
              </div>
              <button type="button" onClick={() => setSelectedUser(null)}><X size={20} /></button>
            </div>

            <div className="command-detail-profile">
              <span>{selectedUser.name?.charAt(0).toUpperCase()}</span>
              <div><strong>{selectedUser.name}</strong><small>{roleLabel(selectedUser.role)}</small></div>
            </div>

            <div className="command-detail-row"><span>Full name</span><strong>{selectedUser.name || "—"}</strong></div>
            <div className="command-detail-row"><span>Email address</span><strong>{selectedUser.email || "—"}</strong></div>
            <div className="command-detail-row"><span>Address</span><strong>{selectedUser.address || "—"}</strong></div>
            <div className="command-detail-row"><span>Account role</span><strong>{roleLabel(selectedUser.role)}</strong></div>

            {selectedUser.role === "store_owner" && (
              <>
                <div className="command-detail-divider"></div>
                <span className="command-overline">OWNER PERFORMANCE</span>
                <div className="command-detail-row"><span>Number of stores</span><strong>{selectedUser.store_count ?? 0}</strong></div>
                <div className="command-detail-row"><span>Store names</span><strong>{selectedUser.store_names || "No stores assigned"}</strong></div>
                <div className="command-detail-row"><span>Average rating</span><strong>{Number(selectedUser.average_rating || 0).toFixed(2)} / 5</strong></div>
                <div className="command-detail-row"><span>Ratings received</span><strong>{selectedUser.total_ratings ?? 0}</strong></div>
              </>
            )}

            <button className="command-primary command-modal-close" type="button" onClick={() => setSelectedUser(null)}>Close record</button>
          </div>
        </div>
      )}

      {showUserForm && (
        <div className="command-modal-backdrop" onClick={() => setShowUserForm(false)}>
          <form className="command-modal" onSubmit={handleCreateUser} onClick={(e) => e.stopPropagation()}>
            <div className="command-modal-heading">
              <div><span className="command-overline">NEW DIRECTORY ENTRY</span><h2>Create account</h2></div>
              <button type="button" onClick={() => setShowUserForm(false)}><X size={20} /></button>
            </div>

            <label>Full name</label>
            <input required minLength="20" maxLength="60" value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} placeholder="Enter full name" />

            <label>Email address</label>
            <input required type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} placeholder="name@example.com" />

            <label>Password</label>
            <input required type="password" minLength="8" maxLength="16" pattern="(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}" title="Use 8–16 characters, at least one uppercase letter and one special character." value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} placeholder="Enter password" />

            <label>Address</label>
            <textarea required maxLength="400" value={userForm.address} onChange={(e) => setUserForm({ ...userForm, address: e.target.value })} placeholder="Enter address" />

            <label>Account role</label>
            <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}>
              <option value="user">Customer</option>
              <option value="admin">Administrator</option>
              <option value="store_owner">Store Owner</option>
            </select>

            <button className="command-primary command-modal-close" type="submit">Create account <ArrowUpRight size={17} /></button>
          </form>
        </div>
      )}

      {showStoreForm && (
        <div className="command-modal-backdrop" onClick={() => setShowStoreForm(false)}>
          <form className="command-modal" onSubmit={handleCreateStore} onClick={(e) => e.stopPropagation()}>
            <div className="command-modal-heading">
              <div><span className="command-overline">NEW BUSINESS ENTRY</span><h2>Register a store</h2></div>
              <button type="button" onClick={() => setShowStoreForm(false)}><X size={20} /></button>
            </div>

            <label>Store name</label>
            <input required minLength="20" maxLength="60" value={storeForm.name} onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })} placeholder="Enter store name" />

            <label>Store email</label>
            <input required type="email" value={storeForm.email} onChange={(e) => setStoreForm({ ...storeForm, email: e.target.value })} placeholder="store@example.com" />

            <label>Store address</label>
            <textarea required maxLength="400" value={storeForm.address} onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })} placeholder="Enter store address" />

            <label>Store owner ID <span>(optional)</span></label>
            <input type="number" min="1" value={storeForm.owner_id} onChange={(e) => setStoreForm({ ...storeForm, owner_id: e.target.value })} placeholder="Enter existing owner user ID" />

            <button className="command-primary command-modal-close" type="submit">Register store <ArrowUpRight size={17} /></button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
