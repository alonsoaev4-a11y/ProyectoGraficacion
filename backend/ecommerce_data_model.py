"""
E-Commerce Platform — complete data model (22 tables, ~28 relationships).

Ready to POST/PUT to  /api/projects/{id}/data-model
using DataModelSave(tables=TABLES, relationships=RELATIONSHIPS).
"""

# ═══════════════════════════════════════════════════════════════════════════════
#  Helper
# ═══════════════════════════════════════════════════════════════════════════════

def _col(table, name, typ, *, pk=False, fk=False, nullable=False, default=None, ref=None):
    """Shorthand to build a column dict."""
    return {
        "id": f"col-{table}-{name}",
        "name": name,
        "type": typ,
        "isPk": pk,
        "isFk": fk,
        "isNullable": nullable,
        "defaultValue": default,
        "references": ref,
    }


def _ref(table, col):
    """Build a references dict."""
    return {"tableId": f"tbl-{table}", "columnId": f"col-{table}-{col}"}


# ═══════════════════════════════════════════════════════════════════════════════
#  TABLES
# ═══════════════════════════════════════════════════════════════════════════════

TABLES = [
    # ── Row 1  (y=50): users, addresses, sessions ─────────────────────────────
    {
        "id": "tbl-users",
        "name": "users",
        "position": {"x": 50, "y": 50},
        "columns": [
            _col("users", "id",             "INT",                     pk=True, default="AUTO_INCREMENT"),
            _col("users", "email",           "VARCHAR(255)"),
            _col("users", "password_hash",   "VARCHAR(255)"),
            _col("users", "name",            "VARCHAR(255)"),
            _col("users", "phone",           "VARCHAR(50)",             nullable=True),
            _col("users", "avatar_url",      "VARCHAR(500)",            nullable=True),
            _col("users", "role",            "ENUM('admin','customer','vendor')", default="'customer'"),
            _col("users", "email_verified",  "BOOLEAN",                 default="FALSE"),
            _col("users", "status",          "ENUM('active','inactive','banned')", default="'active'"),
            _col("users", "created_at",      "TIMESTAMP",               default="CURRENT_TIMESTAMP"),
            _col("users", "updated_at",      "TIMESTAMP",               default="CURRENT_TIMESTAMP"),
        ],
    },
    {
        "id": "tbl-addresses",
        "name": "addresses",
        "position": {"x": 350, "y": 50},
        "columns": [
            _col("addresses", "id",          "INT",          pk=True, default="AUTO_INCREMENT"),
            _col("addresses", "user_id",     "INT",          fk=True, ref=_ref("users", "id")),
            _col("addresses", "label",       "VARCHAR(100)", nullable=True),
            _col("addresses", "street",      "VARCHAR(255)"),
            _col("addresses", "city",        "VARCHAR(100)"),
            _col("addresses", "state",       "VARCHAR(100)"),
            _col("addresses", "postal_code", "VARCHAR(20)"),
            _col("addresses", "country",     "VARCHAR(100)"),
            _col("addresses", "is_default",  "BOOLEAN",      default="FALSE"),
            _col("addresses", "created_at",  "TIMESTAMP",    default="CURRENT_TIMESTAMP"),
        ],
    },
    {
        "id": "tbl-sessions",
        "name": "sessions",
        "position": {"x": 650, "y": 50},
        "columns": [
            _col("sessions", "id",          "INT",          pk=True, default="AUTO_INCREMENT"),
            _col("sessions", "user_id",     "INT",          fk=True, ref=_ref("users", "id")),
            _col("sessions", "token_hash",  "VARCHAR(255)"),
            _col("sessions", "ip_address",  "VARCHAR(45)",  nullable=True),
            _col("sessions", "user_agent",  "TEXT",         nullable=True),
            _col("sessions", "expires_at",  "TIMESTAMP"),
            _col("sessions", "created_at",  "TIMESTAMP",    default="CURRENT_TIMESTAMP"),
        ],
    },

    # ── Row 2  (y=250): categories, products, product_variants, product_images ─
    {
        "id": "tbl-categories",
        "name": "categories",
        "position": {"x": 50, "y": 250},
        "columns": [
            _col("categories", "id",          "INT",          pk=True, default="AUTO_INCREMENT"),
            _col("categories", "parent_id",   "INT",          fk=True, nullable=True, ref=_ref("categories", "id")),
            _col("categories", "name",        "VARCHAR(255)"),
            _col("categories", "slug",        "VARCHAR(255)"),
            _col("categories", "description", "TEXT",         nullable=True),
            _col("categories", "image_url",   "VARCHAR(500)", nullable=True),
            _col("categories", "is_active",   "BOOLEAN",      default="TRUE"),
            _col("categories", "sort_order",  "INT",          default="0"),
            _col("categories", "created_at",  "TIMESTAMP",    default="CURRENT_TIMESTAMP"),
        ],
    },
    {
        "id": "tbl-products",
        "name": "products",
        "position": {"x": 350, "y": 250},
        "columns": [
            _col("products", "id",                 "INT",           pk=True, default="AUTO_INCREMENT"),
            _col("products", "category_id",        "INT",           fk=True, ref=_ref("categories", "id")),
            _col("products", "name",               "VARCHAR(255)"),
            _col("products", "slug",               "VARCHAR(255)"),
            _col("products", "description",        "TEXT",          nullable=True),
            _col("products", "short_description",  "VARCHAR(500)",  nullable=True),
            _col("products", "sku",                "VARCHAR(100)"),
            _col("products", "base_price",         "DECIMAL(10,2)"),
            _col("products", "compare_price",      "DECIMAL(10,2)", nullable=True),
            _col("products", "cost_price",         "DECIMAL(10,2)", nullable=True),
            _col("products", "stock_quantity",     "INT",           default="0"),
            _col("products", "low_stock_threshold","INT",           default="5"),
            _col("products", "weight",             "DECIMAL(8,2)",  nullable=True),
            _col("products", "dimensions_json",    "JSON",          nullable=True),
            _col("products", "is_active",          "BOOLEAN",       default="TRUE"),
            _col("products", "is_featured",        "BOOLEAN",       default="FALSE"),
            _col("products", "meta_title",         "VARCHAR(255)",  nullable=True),
            _col("products", "meta_description",   "VARCHAR(500)",  nullable=True),
            _col("products", "created_at",         "TIMESTAMP",     default="CURRENT_TIMESTAMP"),
            _col("products", "updated_at",         "TIMESTAMP",     default="CURRENT_TIMESTAMP"),
        ],
    },
    {
        "id": "tbl-product_variants",
        "name": "product_variants",
        "position": {"x": 650, "y": 250},
        "columns": [
            _col("product_variants", "id",              "INT",           pk=True, default="AUTO_INCREMENT"),
            _col("product_variants", "product_id",      "INT",           fk=True, ref=_ref("products", "id")),
            _col("product_variants", "sku",             "VARCHAR(100)"),
            _col("product_variants", "name",            "VARCHAR(255)"),
            _col("product_variants", "price_modifier",  "DECIMAL(10,2)", default="0.00"),
            _col("product_variants", "stock_quantity",  "INT",           default="0"),
            _col("product_variants", "attributes_json", "JSON",          nullable=True),
            _col("product_variants", "is_active",       "BOOLEAN",       default="TRUE"),
            _col("product_variants", "created_at",      "TIMESTAMP",     default="CURRENT_TIMESTAMP"),
        ],
    },
    {
        "id": "tbl-product_images",
        "name": "product_images",
        "position": {"x": 950, "y": 250},
        "columns": [
            _col("product_images", "id",         "INT",          pk=True, default="AUTO_INCREMENT"),
            _col("product_images", "product_id", "INT",          fk=True, ref=_ref("products", "id")),
            _col("product_images", "url",        "VARCHAR(500)"),
            _col("product_images", "alt_text",   "VARCHAR(255)", nullable=True),
            _col("product_images", "sort_order", "INT",          default="0"),
            _col("product_images", "is_primary", "BOOLEAN",      default="FALSE"),
            _col("product_images", "created_at", "TIMESTAMP",    default="CURRENT_TIMESTAMP"),
        ],
    },

    # ── Row 3  (y=450): reviews, carts, cart_items ────────────────────────────
    {
        "id": "tbl-reviews",
        "name": "reviews",
        "position": {"x": 50, "y": 450},
        "columns": [
            _col("reviews", "id",                   "INT",     pk=True, default="AUTO_INCREMENT"),
            _col("reviews", "product_id",           "INT",     fk=True, ref=_ref("products", "id")),
            _col("reviews", "user_id",              "INT",     fk=True, ref=_ref("users", "id")),
            _col("reviews", "rating",               "INT"),
            _col("reviews", "title",                "VARCHAR(255)", nullable=True),
            _col("reviews", "comment",              "TEXT",    nullable=True),
            _col("reviews", "is_verified_purchase",  "BOOLEAN", default="FALSE"),
            _col("reviews", "is_approved",           "BOOLEAN", default="FALSE"),
            _col("reviews", "helpful_count",         "INT",     default="0"),
            _col("reviews", "created_at",           "TIMESTAMP", default="CURRENT_TIMESTAMP"),
        ],
    },
    {
        "id": "tbl-carts",
        "name": "carts",
        "position": {"x": 350, "y": 450},
        "columns": [
            _col("carts", "id",         "INT",                      pk=True, default="AUTO_INCREMENT"),
            _col("carts", "user_id",    "INT",                      fk=True, nullable=True, ref=_ref("users", "id")),
            _col("carts", "session_id", "VARCHAR(255)",             nullable=True),
            _col("carts", "status",     "ENUM('active','merged','abandoned','converted')", default="'active'"),
            _col("carts", "expires_at", "TIMESTAMP",               nullable=True),
            _col("carts", "created_at", "TIMESTAMP",               default="CURRENT_TIMESTAMP"),
            _col("carts", "updated_at", "TIMESTAMP",               default="CURRENT_TIMESTAMP"),
        ],
    },
    {
        "id": "tbl-cart_items",
        "name": "cart_items",
        "position": {"x": 650, "y": 450},
        "columns": [
            _col("cart_items", "id",          "INT",          pk=True, default="AUTO_INCREMENT"),
            _col("cart_items", "cart_id",     "INT",          fk=True, ref=_ref("carts", "id")),
            _col("cart_items", "product_id",  "INT",          fk=True, ref=_ref("products", "id")),
            _col("cart_items", "variant_id",  "INT",          fk=True, nullable=True, ref=_ref("product_variants", "id")),
            _col("cart_items", "quantity",    "INT",          default="1"),
            _col("cart_items", "unit_price",  "DECIMAL(10,2)"),
            _col("cart_items", "created_at",  "TIMESTAMP",    default="CURRENT_TIMESTAMP"),
        ],
    },

    # ── Row 4  (y=650): orders, order_items, payments, refunds, shipments ─────
    {
        "id": "tbl-orders",
        "name": "orders",
        "position": {"x": 50, "y": 650},
        "columns": [
            _col("orders", "id",                    "INT",                     pk=True, default="AUTO_INCREMENT"),
            _col("orders", "user_id",               "INT",                     fk=True, nullable=True, ref=_ref("users", "id")),
            _col("orders", "order_number",          "VARCHAR(50)"),
            _col("orders", "email",                 "VARCHAR(255)"),
            _col("orders", "shipping_address_json", "JSON"),
            _col("orders", "billing_address_json",  "JSON"),
            _col("orders", "subtotal",              "DECIMAL(10,2)"),
            _col("orders", "shipping_cost",         "DECIMAL(10,2)",           default="0.00"),
            _col("orders", "tax_amount",            "DECIMAL(10,2)",           default="0.00"),
            _col("orders", "discount_amount",       "DECIMAL(10,2)",           default="0.00"),
            _col("orders", "total",                 "DECIMAL(10,2)"),
            _col("orders", "status",                "ENUM('pending','confirmed','processing','shipped','delivered','cancelled','returned')", default="'pending'"),
            _col("orders", "payment_status",        "ENUM('pending','paid','partially_refunded','refunded','failed')", default="'pending'"),
            _col("orders", "shipping_method",       "VARCHAR(100)",            nullable=True),
            _col("orders", "notes",                 "TEXT",                    nullable=True),
            _col("orders", "created_at",            "TIMESTAMP",               default="CURRENT_TIMESTAMP"),
            _col("orders", "updated_at",            "TIMESTAMP",               default="CURRENT_TIMESTAMP"),
        ],
    },
    {
        "id": "tbl-order_items",
        "name": "order_items",
        "position": {"x": 350, "y": 650},
        "columns": [
            _col("order_items", "id",           "INT",           pk=True, default="AUTO_INCREMENT"),
            _col("order_items", "order_id",     "INT",           fk=True, ref=_ref("orders", "id")),
            _col("order_items", "product_id",   "INT",           fk=True, ref=_ref("products", "id")),
            _col("order_items", "variant_id",   "INT",           fk=True, nullable=True, ref=_ref("product_variants", "id")),
            _col("order_items", "product_name", "VARCHAR(255)"),
            _col("order_items", "product_sku",  "VARCHAR(100)"),
            _col("order_items", "quantity",     "INT"),
            _col("order_items", "unit_price",   "DECIMAL(10,2)"),
            _col("order_items", "total_price",  "DECIMAL(10,2)"),
            _col("order_items", "created_at",   "TIMESTAMP",     default="CURRENT_TIMESTAMP"),
        ],
    },
    {
        "id": "tbl-payments",
        "name": "payments",
        "position": {"x": 650, "y": 650},
        "columns": [
            _col("payments", "id",                      "INT",          pk=True, default="AUTO_INCREMENT"),
            _col("payments", "order_id",                "INT",          fk=True, ref=_ref("orders", "id")),
            _col("payments", "payment_method",          "VARCHAR(50)"),
            _col("payments", "gateway_transaction_id",  "VARCHAR(255)", nullable=True),
            _col("payments", "amount",                  "DECIMAL(10,2)"),
            _col("payments", "currency",                "VARCHAR(3)",   default="'USD'"),
            _col("payments", "status",                  "ENUM('pending','completed','failed','refunded')", default="'pending'"),
            _col("payments", "gateway_response_json",   "JSON",         nullable=True),
            _col("payments", "paid_at",                 "TIMESTAMP",    nullable=True),
            _col("payments", "created_at",              "TIMESTAMP",    default="CURRENT_TIMESTAMP"),
        ],
    },
    {
        "id": "tbl-refunds",
        "name": "refunds",
        "position": {"x": 950, "y": 650},
        "columns": [
            _col("refunds", "id",           "INT",          pk=True, default="AUTO_INCREMENT"),
            _col("refunds", "order_id",     "INT",          fk=True, ref=_ref("orders", "id")),
            _col("refunds", "payment_id",   "INT",          fk=True, ref=_ref("payments", "id")),
            _col("refunds", "amount",       "DECIMAL(10,2)"),
            _col("refunds", "reason",       "TEXT",         nullable=True),
            _col("refunds", "status",       "ENUM('pending','approved','processed','rejected')", default="'pending'"),
            _col("refunds", "admin_notes",  "TEXT",         nullable=True),
            _col("refunds", "processed_by", "INT",          fk=True, nullable=True, ref=_ref("users", "id")),
            _col("refunds", "refunded_at",  "TIMESTAMP",    nullable=True),
            _col("refunds", "created_at",   "TIMESTAMP",    default="CURRENT_TIMESTAMP"),
        ],
    },
    {
        "id": "tbl-shipments",
        "name": "shipments",
        "position": {"x": 1250, "y": 650},
        "columns": [
            _col("shipments", "id",              "INT",          pk=True, default="AUTO_INCREMENT"),
            _col("shipments", "order_id",        "INT",          fk=True, ref=_ref("orders", "id")),
            _col("shipments", "carrier",         "VARCHAR(100)"),
            _col("shipments", "tracking_number", "VARCHAR(255)", nullable=True),
            _col("shipments", "tracking_url",    "VARCHAR(500)", nullable=True),
            _col("shipments", "status",          "ENUM('pending','picked_up','in_transit','out_for_delivery','delivered','failed')", default="'pending'"),
            _col("shipments", "shipped_at",      "TIMESTAMP",    nullable=True),
            _col("shipments", "delivered_at",    "TIMESTAMP",    nullable=True),
            _col("shipments", "created_at",      "TIMESTAMP",    default="CURRENT_TIMESTAMP"),
            _col("shipments", "updated_at",      "TIMESTAMP",    default="CURRENT_TIMESTAMP"),
        ],
    },

    # ── Row 5  (y=850): promotions, coupons, coupon_usage ─────────────────────
    {
        "id": "tbl-promotions",
        "name": "promotions",
        "position": {"x": 50, "y": 850},
        "columns": [
            _col("promotions", "id",           "INT",          pk=True, default="AUTO_INCREMENT"),
            _col("promotions", "name",         "VARCHAR(255)"),
            _col("promotions", "description",  "TEXT",         nullable=True),
            _col("promotions", "type",         "ENUM('percentage','fixed','bogo','free_shipping')"),
            _col("promotions", "value",        "DECIMAL(10,2)"),
            _col("promotions", "min_purchase", "DECIMAL(10,2)", nullable=True),
            _col("promotions", "max_discount", "DECIMAL(10,2)", nullable=True),
            _col("promotions", "start_date",   "TIMESTAMP"),
            _col("promotions", "end_date",     "TIMESTAMP"),
            _col("promotions", "is_active",    "BOOLEAN",       default="TRUE"),
            _col("promotions", "usage_limit",  "INT",           nullable=True),
            _col("promotions", "usage_count",  "INT",           default="0"),
            _col("promotions", "created_at",   "TIMESTAMP",     default="CURRENT_TIMESTAMP"),
        ],
    },
    {
        "id": "tbl-coupons",
        "name": "coupons",
        "position": {"x": 350, "y": 850},
        "columns": [
            _col("coupons", "id",           "INT",          pk=True, default="AUTO_INCREMENT"),
            _col("coupons", "promotion_id", "INT",          fk=True, ref=_ref("promotions", "id")),
            _col("coupons", "code",         "VARCHAR(50)"),
            _col("coupons", "is_active",    "BOOLEAN",       default="TRUE"),
            _col("coupons", "max_uses",     "INT",           nullable=True),
            _col("coupons", "created_at",   "TIMESTAMP",     default="CURRENT_TIMESTAMP"),
        ],
    },
    {
        "id": "tbl-coupon_usage",
        "name": "coupon_usage",
        "position": {"x": 650, "y": 850},
        "columns": [
            _col("coupon_usage", "id",               "INT",          pk=True, default="AUTO_INCREMENT"),
            _col("coupon_usage", "coupon_id",        "INT",          fk=True, ref=_ref("coupons", "id")),
            _col("coupon_usage", "order_id",         "INT",          fk=True, ref=_ref("orders", "id")),
            _col("coupon_usage", "user_id",          "INT",          fk=True, nullable=True, ref=_ref("users", "id")),
            _col("coupon_usage", "discount_applied", "DECIMAL(10,2)"),
            _col("coupon_usage", "used_at",          "TIMESTAMP",    default="CURRENT_TIMESTAMP"),
        ],
    },

    # ── Row 6  (y=1050): notifications, wishlists, wishlist_items, audit_logs ─
    {
        "id": "tbl-notifications",
        "name": "notifications",
        "position": {"x": 50, "y": 1050},
        "columns": [
            _col("notifications", "id",        "INT",          pk=True, default="AUTO_INCREMENT"),
            _col("notifications", "user_id",   "INT",          fk=True, ref=_ref("users", "id")),
            _col("notifications", "type",      "ENUM('order','promotion','system','review')"),
            _col("notifications", "title",     "VARCHAR(255)"),
            _col("notifications", "message",   "TEXT"),
            _col("notifications", "data_json", "JSON",         nullable=True),
            _col("notifications", "is_read",   "BOOLEAN",      default="FALSE"),
            _col("notifications", "read_at",   "TIMESTAMP",    nullable=True),
            _col("notifications", "created_at","TIMESTAMP",    default="CURRENT_TIMESTAMP"),
        ],
    },
    {
        "id": "tbl-wishlists",
        "name": "wishlists",
        "position": {"x": 350, "y": 1050},
        "columns": [
            _col("wishlists", "id",         "INT",          pk=True, default="AUTO_INCREMENT"),
            _col("wishlists", "user_id",    "INT",          fk=True, ref=_ref("users", "id")),
            _col("wishlists", "name",       "VARCHAR(255)", default="'My Wishlist'"),
            _col("wishlists", "is_public",  "BOOLEAN",      default="FALSE"),
            _col("wishlists", "created_at", "TIMESTAMP",    default="CURRENT_TIMESTAMP"),
            _col("wishlists", "updated_at", "TIMESTAMP",    default="CURRENT_TIMESTAMP"),
        ],
    },
    {
        "id": "tbl-wishlist_items",
        "name": "wishlist_items",
        "position": {"x": 650, "y": 1050},
        "columns": [
            _col("wishlist_items", "id",          "INT",       pk=True, default="AUTO_INCREMENT"),
            _col("wishlist_items", "wishlist_id", "INT",       fk=True, ref=_ref("wishlists", "id")),
            _col("wishlist_items", "product_id",  "INT",       fk=True, ref=_ref("products", "id")),
            _col("wishlist_items", "added_at",    "TIMESTAMP", default="CURRENT_TIMESTAMP"),
        ],
    },
    {
        "id": "tbl-audit_logs",
        "name": "audit_logs",
        "position": {"x": 950, "y": 1050},
        "columns": [
            _col("audit_logs", "id",              "INT",          pk=True, default="AUTO_INCREMENT"),
            _col("audit_logs", "user_id",         "INT",          fk=True, nullable=True, ref=_ref("users", "id")),
            _col("audit_logs", "entity_type",     "VARCHAR(100)"),
            _col("audit_logs", "entity_id",       "INT"),
            _col("audit_logs", "action",          "VARCHAR(50)"),
            _col("audit_logs", "old_values_json", "JSON",         nullable=True),
            _col("audit_logs", "new_values_json", "JSON",         nullable=True),
            _col("audit_logs", "ip_address",      "VARCHAR(45)",  nullable=True),
            _col("audit_logs", "created_at",      "TIMESTAMP",    default="CURRENT_TIMESTAMP"),
        ],
    },
]


# ═══════════════════════════════════════════════════════════════════════════════
#  RELATIONSHIPS  (28 total)
# ═══════════════════════════════════════════════════════════════════════════════

RELATIONSHIPS = [
    # --- users → addresses  (1:N) ---
    {"id": "rel-1",  "fromTable": "tbl-users",       "toTable": "tbl-addresses",      "type": "1:N"},
    # --- users → sessions  (1:N) ---
    {"id": "rel-2",  "fromTable": "tbl-users",       "toTable": "tbl-sessions",       "type": "1:N"},
    # --- categories → categories (self-ref, 1:N) ---
    {"id": "rel-3",  "fromTable": "tbl-categories",  "toTable": "tbl-categories",     "type": "1:N"},
    # --- categories → products  (1:N) ---
    {"id": "rel-4",  "fromTable": "tbl-categories",  "toTable": "tbl-products",       "type": "1:N"},
    # --- products → product_variants  (1:N) ---
    {"id": "rel-5",  "fromTable": "tbl-products",    "toTable": "tbl-product_variants","type": "1:N"},
    # --- products → product_images  (1:N) ---
    {"id": "rel-6",  "fromTable": "tbl-products",    "toTable": "tbl-product_images", "type": "1:N"},
    # --- products → reviews  (1:N) ---
    {"id": "rel-7",  "fromTable": "tbl-products",    "toTable": "tbl-reviews",        "type": "1:N"},
    # --- users → reviews  (1:N) ---
    {"id": "rel-8",  "fromTable": "tbl-users",       "toTable": "tbl-reviews",        "type": "1:N"},
    # --- users → carts  (1:N) ---
    {"id": "rel-9",  "fromTable": "tbl-users",       "toTable": "tbl-carts",          "type": "1:N"},
    # --- carts → cart_items  (1:N) ---
    {"id": "rel-10", "fromTable": "tbl-carts",       "toTable": "tbl-cart_items",     "type": "1:N"},
    # --- products → cart_items  (1:N) ---
    {"id": "rel-11", "fromTable": "tbl-products",    "toTable": "tbl-cart_items",     "type": "1:N"},
    # --- product_variants → cart_items  (1:N) ---
    {"id": "rel-12", "fromTable": "tbl-product_variants", "toTable": "tbl-cart_items", "type": "1:N"},
    # --- users → orders  (1:N) ---
    {"id": "rel-13", "fromTable": "tbl-users",       "toTable": "tbl-orders",         "type": "1:N"},
    # --- orders → order_items  (1:N) ---
    {"id": "rel-14", "fromTable": "tbl-orders",      "toTable": "tbl-order_items",    "type": "1:N"},
    # --- products → order_items  (1:N) ---
    {"id": "rel-15", "fromTable": "tbl-products",    "toTable": "tbl-order_items",    "type": "1:N"},
    # --- product_variants → order_items  (1:N) ---
    {"id": "rel-16", "fromTable": "tbl-product_variants", "toTable": "tbl-order_items","type": "1:N"},
    # --- orders → payments  (1:N) ---
    {"id": "rel-17", "fromTable": "tbl-orders",      "toTable": "tbl-payments",       "type": "1:N"},
    # --- orders → refunds  (1:N) ---
    {"id": "rel-18", "fromTable": "tbl-orders",      "toTable": "tbl-refunds",        "type": "1:N"},
    # --- payments → refunds  (1:N) ---
    {"id": "rel-19", "fromTable": "tbl-payments",    "toTable": "tbl-refunds",        "type": "1:N"},
    # --- users → refunds (processed_by)  (1:N) ---
    {"id": "rel-20", "fromTable": "tbl-users",       "toTable": "tbl-refunds",        "type": "1:N"},
    # --- orders → shipments  (1:N) ---
    {"id": "rel-21", "fromTable": "tbl-orders",      "toTable": "tbl-shipments",      "type": "1:N"},
    # --- promotions → coupons  (1:N) ---
    {"id": "rel-22", "fromTable": "tbl-promotions",  "toTable": "tbl-coupons",        "type": "1:N"},
    # --- coupons → coupon_usage  (1:N) ---
    {"id": "rel-23", "fromTable": "tbl-coupons",     "toTable": "tbl-coupon_usage",   "type": "1:N"},
    # --- orders → coupon_usage  (1:N) ---
    {"id": "rel-24", "fromTable": "tbl-orders",      "toTable": "tbl-coupon_usage",   "type": "1:N"},
    # --- users → coupon_usage  (1:N) ---
    {"id": "rel-25", "fromTable": "tbl-users",       "toTable": "tbl-coupon_usage",   "type": "1:N"},
    # --- users → notifications  (1:N) ---
    {"id": "rel-26", "fromTable": "tbl-users",       "toTable": "tbl-notifications",  "type": "1:N"},
    # --- users → wishlists  (1:N) ---
    {"id": "rel-27", "fromTable": "tbl-users",       "toTable": "tbl-wishlists",      "type": "1:N"},
    # --- wishlists → wishlist_items  (1:N) ---
    {"id": "rel-28", "fromTable": "tbl-wishlists",   "toTable": "tbl-wishlist_items", "type": "1:N"},
    # --- products → wishlist_items  (1:N) ---
    {"id": "rel-29", "fromTable": "tbl-products",    "toTable": "tbl-wishlist_items", "type": "1:N"},
    # --- users → audit_logs  (1:N) ---
    {"id": "rel-30", "fromTable": "tbl-users",       "toTable": "tbl-audit_logs",     "type": "1:N"},
]
