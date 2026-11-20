
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Store,
  Star,
  Users,
  LogOut,
  MapPin,
  Mail,
  RefreshCw,
  TrendingUp,
  ShieldCheck,
  ArrowUpRight,
  CalendarDays,
  MessageSquareText,
  Building2,
  BarChart3,
  LockKeyhole
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const OwnerDashboard = () => {
  const { user, logout } = useAuth();

  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/owner/dashboard");
      const data = response.data;

      const storeData = data.stores || data.data?.stores || [];
      const ratingData = data.ratings || data.data?.ratings || [];

      const updatedStores = storeData.map((store) => ({
        ...store,
        ratings: ratingData.filter(
          (rating) =>
            String(rating.store_id) === String(store.id)
        )
      }));

      setStores(updatedStores);
      setLastUpdated(new Date());
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load your store dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const getRatings = (store) => {
    return (
      store.ratings ||
      store.recent_ratings ||
      store.customers ||
      []
    );
  };

  const getStoreTotal = (store) => {
    return Number(
      store.total_ratings ??
      store.rating_count ??
      getRatings(store).length ??
      0
    );
  };

  const getStoreAverage = (store) => {
    const average = Number(
      store.average_rating ??
      store.averageRating ??
      0
    );

    return Number.isFinite(average) ? average : 0;
  };

  const getCustomerName = (rating) => {
    return (
      rating.user_name ||
      rating.customerName ||
      rating.name ||
      "Customer"
    );
  };

  const getCustomerEmail = (rating) => {
    return (
      rating.user_email ||
      rating.customerEmail ||
      rating.email ||
      "Email unavailable"
    );
  };

  const getRatingDate = (rating) => {
    const date =
      rating.updated_at ||
      rating.ratingDate ||
      rating.created_at;

    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    return Number.isNaN(parsedDate.getTime())
      ? "Date unavailable"
      : parsedDate.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric"
        });
  };

  const totalRatings = useMemo(
    () => stores.reduce(
      (total, store) => total + getStoreTotal(store),
      0
    ),
    [stores]
  );

  const averageRating = useMemo(() => {
    if (!totalRatings) return "0.0";

    const weightedTotal = stores.reduce(
      (total, store) =>
        total +
        getStoreAverage(store) * getStoreTotal(store),
      0
    );

    return (weightedTotal / totalRatings).toFixed(1);
  }, [stores, totalRatings]);

  const allRatings = useMemo(
    () => stores.flatMap((store) => getRatings(store)),
    [stores]
  );

  const ratingDistribution = useMemo(
    () => [5, 4, 3, 2, 1].map((value) => {
      const count = allRatings.filter(
        (rating) => Number(rating.rating) === value
      ).length;

      return {
        value,
        count,
        percentage: allRatings.length
          ? (count / allRatings.length) * 100
          : 0
      };
    }),
    [allRatings]
  );

  const recentFeedback = useMemo(
    () => stores
      .flatMap((store) =>
        getRatings(store).map((rating) => ({
          ...rating,
          storeName: store.name
        }))
      )
      .sort((a, b) => {
        const dateA = new Date(
          a.updated_at || a.ratingDate || a.created_at || 0
        ).getTime();

        const dateB = new Date(
          b.updated_at || b.ratingDate || b.created_at || 0
        ).getTime();

        return dateB - dateA;
      })
      .slice(0, 8),
    [stores]
  );

  return (
    <div className="owner-studio">
      <header className="owner-studio-header">
        <Link to="/owner" className="owner-studio-brand">
          <span className="owner-studio-brand-icon">
            <Store size={21} />
          </span>

          <span>
            ROXILOR<span> / BUSINESS</span>
          </span>
        </Link>

        <div className="owner-studio-header-right">
          <span className="owner-studio-live">
            <span />
            OWNER WORKSPACE
          </span>

          <div className="owner-studio-user">
            <div className="owner-studio-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || "O"}
            </div>

            <div>
              <strong>{user?.name || "Store Owner"}</strong>
              <span>Business account</span>
            </div>
          </div>

          <Link
            to="/change-password"
            className="owner-studio-icon-button"
            title="Change password"
            aria-label="Change password"
          >
            <LockKeyhole size={18} />
          </Link>

          <button
            className="owner-studio-icon-button"
            onClick={logout}
            type="button"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="owner-studio-main">
        <div className="owner-studio-heading">
          <div>
            <div className="owner-studio-kicker">
              BUSINESS INTELLIGENCE / OVERVIEW
            </div>

            <h1>Your business, in perspective.</h1>

            <p>
              Understand customer sentiment and follow the
              performance of your stores.
            </p>
          </div>

          <button
            className="owner-studio-refresh"
            onClick={loadDashboard}
            disabled={loading}
            type="button"
          >
            <RefreshCw
              size={16}
              className={loading ? "owner-studio-spinning" : ""}
            />
            {loading ? "Updating" : "Refresh report"}
          </button>
        </div>

        {error && (
          <div className="owner-studio-error" role="alert">
            {error}
          </div>
        )}

        <section className="owner-studio-report">
          <div className="owner-studio-report-copy">
            <span className="owner-studio-report-label">
              YOUR CUSTOMER EXPERIENCE REPORT
            </span>

            <h2>
              {loading
                ? "Preparing your report..."
                : `Good work, ${user?.name?.split(" ")[0] || "there"}.`}
            </h2>

            <p>
              Every rating tells a story. Use customer feedback
              to understand what is working across your business.
            </p>

            <div className="owner-studio-report-meta">
              <ShieldCheck size={16} />
              Your private business overview
            </div>
          </div>

          <div className="owner-studio-score">
            <span>OVERALL SCORE</span>

            <strong>
              {loading ? "—" : averageRating}
              <small>/5</small>
            </strong>

            <div className="owner-studio-score-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={17}
                  fill={
                    star <= Math.round(Number(averageRating))
                      ? "currentColor"
                      : "none"
                  }
                />
              ))}
            </div>

            <span className="owner-studio-score-caption">
              Weighted across your stores
            </span>
          </div>
        </section>

        <section className="owner-studio-metrics">
          <article className="owner-studio-metric">
            <div className="owner-studio-metric-top">
              <span>PORTFOLIO</span>
              <Building2 size={19} />
            </div>

            <strong>{loading ? "—" : stores.length}</strong>
            <p>Stores under your account</p>
          </article>

          <article className="owner-studio-metric">
            <div className="owner-studio-metric-top">
              <span>ENGAGEMENT</span>
              <MessageSquareText size={19} />
            </div>

            <strong>{loading ? "—" : totalRatings}</strong>
            <p>Customer ratings received</p>
          </article>

          <article className="owner-studio-metric">
            <div className="owner-studio-metric-top">
              <span>REPUTATION</span>
              <TrendingUp size={19} />
            </div>

            <strong>{loading ? "—" : `${averageRating}/5`}</strong>
            <p>Overall customer rating</p>
          </article>
        </section>

        <section className="owner-studio-insights">
          <article className="owner-studio-panel owner-studio-distribution">
            <div className="owner-studio-panel-heading">
              <div>
                <span>FEEDBACK ANALYSIS</span>
                <h2>Rating distribution</h2>
              </div>

              <BarChart3 size={21} />
            </div>

            <p className="owner-studio-panel-description">
              How customers have rated your stores.
            </p>

            {loading ? (
              <div className="owner-studio-empty">
                Loading rating data...
              </div>
            ) : allRatings.length === 0 ? (
              <div className="owner-studio-empty">
                No rating breakdown is available yet.
              </div>
            ) : (
              <div className="owner-studio-bars">
                {ratingDistribution.map((item) => (
                  <div
                    className="owner-studio-bar-row"
                    key={item.value}
                  >
                    <span>{item.value} <Star size={12} fill="currentColor" /></span>

                    <div className="owner-studio-bar-track">
                      <div
                        className={`owner-studio-bar-fill rating-${item.value}`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>

                    <strong>{item.count}</strong>
                  </div>
                ))}
              </div>
            )}

            <div className="owner-studio-distribution-foot">
              <span>Based on available customer feedback</span>
              <strong>{allRatings.length} entries</strong>
            </div>
          </article>

          <article className="owner-studio-panel owner-studio-portfolio">
            <div className="owner-studio-panel-heading">
              <div>
                <span>BUSINESS PORTFOLIO</span>
                <h2>Store snapshot</h2>
              </div>

              <Store size={21} />
            </div>

            {loading ? (
              <div className="owner-studio-empty">
                Loading stores...
              </div>
            ) : stores.length === 0 ? (
              <div className="owner-studio-empty">
                No stores are assigned to your account.
              </div>
            ) : (
              <div className="owner-studio-portfolio-list">
                {stores.slice(0, 5).map((store) => (
                  <div
                    className="owner-studio-portfolio-item"
                    key={store.id}
                  >
                    <div className="owner-studio-portfolio-icon">
                      <Store size={17} />
                    </div>

                    <div className="owner-studio-portfolio-name">
                      <strong>{store.name}</strong>
                      <span>{getStoreTotal(store)} customer ratings</span>
                    </div>

                    <div className="owner-studio-portfolio-score">
                      <Star size={14} fill="currentColor" />
                      {getStoreAverage(store).toFixed(1)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {stores.length > 5 && (
              <div className="owner-studio-more-stores">
                + {stores.length - 5} more stores in your portfolio
              </div>
            )}
          </article>
        </section>

        <section className="owner-studio-stores-section">
          <div className="owner-studio-section-title">
            <div>
              <span>MANAGE YOUR LOCATIONS</span>
              <h2>Store performance</h2>
              <p>
                A closer look at every business location assigned to you.
              </p>
            </div>

            <span className="owner-studio-store-count">
              {stores.length} {stores.length === 1 ? "STORE" : "STORES"}
            </span>
          </div>

          {loading ? (
            <div className="owner-studio-empty owner-studio-large-empty">
              <RefreshCw size={23} />
              <p>Loading your store information...</p>
            </div>
          ) : stores.length === 0 ? (
            <div className="owner-studio-empty owner-studio-large-empty">
              <Store size={32} />
              <h3>No stores assigned</h3>
              <p>
                Contact your administrator to assign a store
                to your account.
              </p>
            </div>
          ) : (
            <div className="owner-studio-store-list">
              {stores.map((store, index) => {
                const storeRatings = getRatings(store);
                const storeAverage = getStoreAverage(store);
                const storeTotal = getStoreTotal(store);

                return (
                  <article
                    className="owner-studio-store-card"
                    key={store.id}
                  >
                    <div className="owner-studio-store-index">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <div className="owner-studio-store-main">
                      <div className="owner-studio-store-title">
                        <div className="owner-studio-store-symbol">
                          <Store size={21} />
                        </div>

                        <div>
                          <h3>{store.name}</h3>
                          <span>Registered business location</span>
                        </div>
                      </div>

                      <div className="owner-studio-store-contact">
                        <div>
                          <Mail size={15} />
                          <span>{store.email || "Email not available"}</span>
                        </div>

                        <div>
                          <MapPin size={15} />
                          <span>{store.address || "Address not available"}</span>
                        </div>
                      </div>

                      <div className="owner-studio-store-feedback">
                        <div className="owner-studio-feedback-heading">
                          <div>
                            <MessageSquareText size={16} />
                            <strong>Customer feedback</strong>
                          </div>

                          <span>{storeTotal} ratings</span>
                        </div>

                        {storeRatings.length === 0 ? (
                          <p className="owner-studio-no-feedback">
                            No customer ratings have been submitted yet.
                          </p>
                        ) : (
                          <div className="owner-studio-review-list">
                            {storeRatings.slice(0, 4).map((rating, ratingIndex) => (
                              <div
                                className="owner-studio-review"
                                key={
                                  rating.id ||
                                  `${rating.user_id}-${ratingIndex}`
                                }
                              >
                                <div className="owner-studio-review-avatar">
                                  {getCustomerName(rating)
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>

                                <div className="owner-studio-review-person">
                                  <strong>{getCustomerName(rating)}</strong>
                                  <span>{getCustomerEmail(rating)}</span>
                                </div>

                                <div className="owner-studio-review-rating">
                                  <Star size={14} fill="currentColor" />
                                  {rating.rating} / 5
                                </div>

                                <span className="owner-studio-review-date">
                                  <CalendarDays size={13} />
                                  {getRatingDate(rating)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {storeRatings.length > 4 && (
                          <p className="owner-studio-review-more">
                            Showing 4 of {storeRatings.length} available ratings.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="owner-studio-store-score">
                      <span>AVERAGE SCORE</span>
                      <strong>{storeAverage.toFixed(1)}</strong>
                      <small>out of 5</small>

                      <div className="owner-studio-mini-stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={12}
                            fill={
                              star <= Math.round(storeAverage)
                                ? "currentColor"
                                : "none"
                            }
                          />
                        ))}
                      </div>

                      <span className="owner-studio-store-total">
                        {storeTotal} total ratings
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="owner-studio-recent-section">
          <div className="owner-studio-section-title">
            <div>
              <span>VOICE OF THE CUSTOMER</span>
              <h2>Recent feedback activity</h2>
              <p>Latest available ratings across your stores.</p>
            </div>
          </div>

          {loading ? (
            <div className="owner-studio-empty">
              Loading customer activity...
            </div>
          ) : recentFeedback.length === 0 ? (
            <div className="owner-studio-empty">
              No customer feedback is available yet.
            </div>
          ) : (
            <div className="owner-studio-activity">
              {recentFeedback.map((rating, index) => (
                <div
                  className="owner-studio-activity-item"
                  key={rating.id || `${rating.user_id}-${index}`}
                >
                  <div className="owner-studio-activity-marker">
                    <MessageSquareText size={17} />
                  </div>

                  <div className="owner-studio-activity-copy">
                    <strong>{getCustomerName(rating)}</strong>
                    <span>
                      Rated <b>{rating.storeName}</b>
                    </span>
                  </div>

                  <div className="owner-studio-activity-score">
                    <Star size={14} fill="currentColor" />
                    {rating.rating} / 5
                  </div>

                  <span className="owner-studio-activity-date">
                    {getRatingDate(rating)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <footer className="owner-studio-footer">
          <span>ROXILOR / BUSINESS INSIGHTS</span>

          <span>
            {lastUpdated
              ? `Last updated at ${lastUpdated.toLocaleTimeString()}`
              : "Waiting for report data"}
          </span>
        </footer>
      </main>
    </div>
  );
};

export default OwnerDashboard;
