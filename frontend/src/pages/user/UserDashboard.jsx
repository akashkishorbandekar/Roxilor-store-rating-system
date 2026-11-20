
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Store,
  Star,
  MapPin,
  LogOut,
  RefreshCw,
  Award,
  X
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const UserDashboard = () => {
  const { user, logout } = useAuth();

  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ratings, setRatings] = useState({});
  const [saving, setSaving] = useState(null);
  const [message, setMessage] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const fetchStores = async (query = "") => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/user/stores", {
        params: { search: query }
      });

      const storeList = response.data.stores || [];

      setStores(storeList);

      setRatings(
        Object.fromEntries(
          storeList.map((store) => [
            store.id,
            store.user_rating || 0
          ])
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load stores."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const ratedStores = useMemo(
    () => stores.filter((store) => Number(store.user_rating) > 0),
    [stores]
  );

  const averageRating = useMemo(() => {
    if (ratedStores.length === 0) return "0.0";

    const total = ratedStores.reduce(
      (sum, store) => sum + Number(store.user_rating),
      0
    );

    return (total / ratedStores.length).toFixed(1);
  }, [ratedStores]);

  const ratingDistribution = useMemo(() => {
    const counts = [1, 2, 3, 4, 5].map((rating) => ({
      rating,
      count: ratedStores.filter(
        (store) => Number(store.user_rating) === rating
      ).length
    }));

    const maximum = Math.max(
      ...counts.map((item) => item.count),
      1
    );

    return counts.map((item) => ({
      ...item,
      percentage: (item.count / maximum) * 100
    }));
  }, [ratedStores]);

  const visibleStores = useMemo(() => {
    if (activeFilter === "rated") {
      return stores.filter(
        (store) => Number(store.user_rating) > 0
      );
    }

    if (activeFilter === "unrated") {
      return stores.filter(
        (store) => !Number(store.user_rating)
      );
    }

    return stores;
  }, [stores, activeFilter]);

  const submitRating = async (storeId) => {
    if (!ratings[storeId]) {
      setMessage("Please select a star rating first.");
      return;
    }

    try {
      setSaving(storeId);
      setMessage("");
      setError("");

      await api.post("/ratings", {
        store_id: storeId,
        rating: ratings[storeId]
      });

      setMessage("Your rating has been saved successfully.");
      await fetchStores(search);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to save rating."
      );
    } finally {
      setSaving(null);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStores(search);
  };

  const clearSearch = () => {
    setSearch("");
    setActiveFilter("all");
    fetchStores("");
  };

  const firstName = user?.name?.split(" ")[0] || "Customer";

  return (
    <div className="user-crm-layout">
      <header className="user-crm-header">
        <div className="user-crm-brand">
          <div className="user-crm-brand-icon">
            <Store size={21} />
          </div>

          <span>
            Roxilor<span>Ratings</span>
          </span>
        </div>

        <div className="user-crm-header-right">
          <div className="user-crm-profile">
            <div className="user-crm-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{user?.name}</strong>
              <span>Customer Account</span>
            </div>
          </div>

          <button
            className="user-crm-logout"
            onClick={logout}
            type="button"
          >
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </header>

      <main className="user-crm-main">
        <section className="user-crm-heading">
          <div>
            <span className="user-crm-eyebrow">
              CUSTOMER WORKSPACE
            </span>

            <h1>Welcome back, {firstName}</h1>

            <p>
              Discover stores and share your experiences through ratings.
            </p>
          </div>

          <button
            className="user-crm-refresh"
            onClick={() => fetchStores(search)}
            type="button"
            disabled={loading}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </section>

        {message && (
          <div className="user-crm-alert success">
            {message}
          </div>
        )}

        {error && (
          <div className="user-crm-alert error">
            {error}
          </div>
        )}

        <section className="user-crm-overview">
          <div className="user-crm-overview-heading">
            <div>
              <h2>Your overview</h2>
              <p>A summary of your store rating activity.</p>
            </div>
          </div>

          <div className="user-crm-stats">
            <article className="user-crm-stat">
              <div className="user-crm-stat-top">
                <span>Available Stores</span>
                <Store size={19} />
              </div>

              <strong>{stores.length}</strong>
            </article>

            <article className="user-crm-stat">
              <div className="user-crm-stat-top">
                <span>Stores Rated</span>
                <Award size={19} />
              </div>

              <strong>{ratedStores.length}</strong>
            </article>

            <article className="user-crm-stat">
              <div className="user-crm-stat-top">
                <span>Your Average Rating</span>
                <Star size={19} />
              </div>

              <strong>{averageRating} <small>/ 5</small></strong>
            </article>
          </div>
        </section>

        <section className="user-crm-discovery">
          <div className="user-crm-discovery-heading">
            <div>
              <h2>Explore stores</h2>
              <p>
                Search for stores and see what other customers think.
              </p>
            </div>
          </div>

          <form
            className="user-crm-search"
            onSubmit={handleSearch}
          >
            <Search size={19} />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by store name or address..."
            />

            {search && (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Clear search"
              >
                <X size={17} />
              </button>
            )}

            <button type="submit" disabled={loading}>
              Search
            </button>
          </form>
        </section>

        <section className="user-crm-store-section">
          <div className="user-crm-store-heading">
            <div>
              <h2>Available stores</h2>
              <p>
                Browse stores and manage your ratings.
              </p>
            </div>

            <div className="user-crm-filters">
              <button
                type="button"
                className={activeFilter === "all" ? "active" : ""}
                onClick={() => setActiveFilter("all")}
              >
                All Stores
              </button>

              <button
                type="button"
                className={activeFilter === "rated" ? "active" : ""}
                onClick={() => setActiveFilter("rated")}
              >
                Rated
              </button>

              <button
                type="button"
                className={activeFilter === "unrated" ? "active" : ""}
                onClick={() => setActiveFilter("unrated")}
              >
                Not Rated
              </button>
            </div>
          </div>

          {loading ? (
            <div className="user-crm-empty">
              <RefreshCw size={27} />
              <h3>Loading stores...</h3>
              <p>Please wait while we load available stores.</p>
            </div>
          ) : visibleStores.length === 0 ? (
            <div className="user-crm-empty">
              <Store size={35} />

              <h3>
                {stores.length === 0
                  ? "No stores found"
                  : "No stores in this category"}
              </h3>

              <p>
                {stores.length === 0
                  ? "Try searching with another name or address."
                  : "Try selecting another filter to see more stores."}
              </p>

              <button
                className="user-crm-reset"
                onClick={clearSearch}
                type="button"
              >
                View all stores
              </button>
            </div>
          ) : (
            <div className="user-crm-store-grid">
              {visibleStores.map((store) => (
                <article
                  className="user-crm-store-card"
                  key={store.id}
                >
                  <div className="user-crm-card-top">
                    <div className="user-crm-store-icon">
                      <Store size={21} />
                    </div>

                    <span className="user-crm-available">
                      Available
                    </span>
                  </div>

                  <h3>{store.name}</h3>

                  <div className="user-crm-address">
                    <MapPin size={15} />
                    <span>{store.address}</span>
                  </div>

                  <div className="user-crm-rating-hover">
                    <div className="user-crm-rating-summary">
                      <div className="user-crm-rating-number">
                        <strong>
                          {Number(
                            store.average_rating || 0
                          ).toFixed(1)}
                        </strong>
                        <span>/ 5</span>
                      </div>

                      <div className="user-crm-stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={16}
                            fill={
                              star <= Math.round(
                                Number(store.average_rating || 0)
                              )
                                ? "#C8795A"
                                : "none"
                            }
                            color="#C8795A"
                          />
                        ))}
                      </div>

                      <span className="user-crm-rating-count">
                        {store.total_ratings || 0} ratings
                      </span>
                    </div>

                    <div
                      className="user-crm-rating-popover"
                      role="tooltip"
                    >
                      <h3>Your rating activity</h3>
                      <p>Your submitted ratings</p>

                      <div className="user-crm-distribution">
                        {ratingDistribution.slice().reverse().map((item) => (
                          <div
                            className="user-crm-distribution-row"
                            key={item.rating}
                          >
                            <span>{item.rating}★</span>

                            <div className="user-crm-distribution-track">
                              <div
                                className="user-crm-distribution-fill"
                                style={{
                                  width: `${item.percentage}%`
                                }}
                              />
                            </div>

                            <small>{item.count}</small>
                          </div>
                        ))}
                      </div>

                      <div className="user-crm-popover-footer">
                        {ratedStores.length} submitted{" "}
                        {ratedStores.length === 1 ? "rating" : "ratings"}
                      </div>
                    </div>
                  </div>

                  <div className="user-crm-divider" />

                  <div className="user-crm-rating-entry">
                    <div className="user-crm-rating-label">
                      <strong>Your rating</strong>

                      {store.user_rating ? (
                        <span className="user-crm-rated">
                          <Award size={13} />
                          Previously rated
                        </span>
                      ) : (
                        <span className="user-crm-not-rated">
                          Not rated yet
                        </span>
                      )}
                    </div>

                    <div className="user-crm-rating-select">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() =>
                            setRatings((prev) => ({
                              ...prev,
                              [store.id]: star
                            }))
                          }
                          aria-label={`Rate ${star} stars`}
                          className={
                            ratings[store.id] >= star
                              ? "selected"
                              : ""
                          }
                        >
                          <Star
                            size={22}
                            fill={
                              ratings[store.id] >= star
                                ? "#C8795A"
                                : "none"
                            }
                          />
                        </button>
                      ))}
                    </div>

                    <button
                      className="user-crm-submit-rating"
                      onClick={() => submitRating(store.id)}
                      disabled={
                        !ratings[store.id] ||
                        saving === store.id
                      }
                      type="button"
                    >
                     {saving === store.id
                      ? "Saving..."
                      : Number(store.user_rating) > 0
                        ? "Update rating"
                         : "Rate the store"}

                      <RefreshCw size={15} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="user-crm-footer">
          <span>Roxilor Ratings</span>
          <span>Discover. Rate. Share.</span>
        </footer>
      </main>
    </div>
  );
};

export default UserDashboard;
