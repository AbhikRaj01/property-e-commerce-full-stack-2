import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

// Database schema for property e-commerce platform

// Properties table
export const properties = sqliteTable('properties', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  price: integer('price').notNull(),
  location: text('location').notNull(),
  type: text('type').notNull(),
  bedrooms: integer('bedrooms').notNull(),
  bathrooms: integer('bathrooms').notNull(),
  area: integer('area').notNull(),
  images: text('images', { mode: 'json' }).notNull(),
  featured: integer('featured', { mode: 'boolean' }).default(false),
  status: text('status').notNull().default('available'),
  amenities: text('amenities', { mode: 'json' }).notNull(),
  yearBuilt: integer('year_built').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Orders table
export const orders = sqliteTable('orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  propertyId: integer('property_id').notNull().references(() => properties.id),
  buyerName: text('buyer_name').notNull(),
  buyerEmail: text('buyer_email').notNull(),
  buyerPhone: text('buyer_phone').notNull(),
  buyerAddress: text('buyer_address').notNull(),
  buyerCity: text('buyer_city').notNull(),
  buyerState: text('buyer_state').notNull(),
  buyerZipCode: text('buyer_zip_code').notNull(),
  inquiryType: text('inquiry_type').notNull(),
  preferredContactTime: text('preferred_contact_time').notNull(),
  additionalNotes: text('additional_notes'),
  orderStatus: text('order_status').notNull().default('pending'),
  totalValue: integer('total_value').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Favorites table
export const favorites = sqliteTable('favorites', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userIdentifier: text('user_identifier').notNull(),
  propertyId: integer('property_id').notNull().references(() => properties.id),
  createdAt: text('created_at').notNull(),
});

// Cart Items table
export const cartItems = sqliteTable('cart_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userIdentifier: text('user_identifier').notNull(),
  propertyId: integer('property_id').notNull().references(() => properties.id),
  createdAt: text('created_at').notNull(),
});

// Inquiries table
export const inquiries = sqliteTable('inquiries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  propertyId: integer('property_id').notNull().references(() => properties.id),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  message: text('message').notNull(),
  status: text('status').notNull().default('new'),
  createdAt: text('created_at').notNull(),
});