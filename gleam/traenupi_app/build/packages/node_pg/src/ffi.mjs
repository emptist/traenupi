/**
 * FFI (Foreign Function Interface) module for node-postgres integration
 *
 * This module provides the JavaScript implementation for the node_pg Gleam library,
 * bridging Gleam types with the node-postgres (pg) library.
 *
 * Key responsibilities:
 * - Type conversion between Gleam and JavaScript (Lists, Options, Results)
 * - Client lifecycle management (connect, disconnect)
 * - Query execution and result mapping
 * - Error handling and DatabaseError creation
 *
 * @module ffi
 */

import { Client as PgClient } from 'pg'
import { Ok, Error, Empty, NonEmpty, toList } from './gleam.mjs'
import { Some, None } from '../gleam_stdlib/gleam/option.mjs'

// ============================================================================
// Type Conversion Helper Functions
// ============================================================================

/**
 * Convert Gleam List to JavaScript Array
 * @param {any} gleamList - Gleam List structure (Empty or NonEmpty)
 * @returns {Array} JavaScript array
 */
export function listToArray(gleamList) {
  // Use the built-in toArray method from Gleam's List class
  return gleamList.toArray();
}

/**
 * Convert JavaScript Array to Gleam List
 * @param {Array} jsArray - JavaScript array
 * @returns {any} Gleam List structure
 */
export function arrayToList(jsArray) {
  // Use Gleam's built-in toList function
  return toList(jsArray);
}

/**
 * Test function: Gleam List → JS Array → Gleam List (round trip)
 * This is used by the test suite to verify conversions work correctly
 */
export function testListToArray(gleamList) {
  const jsArray = listToArray(gleamList);
  return arrayToList(jsArray);
}

/**
 * Test function: JS Array → Gleam List → JS Array (round trip)
 * This is used by the test suite to verify conversions work correctly
 */
export function testArrayToList(gleamList) {
  // The input is already a Gleam list from the test
  const jsArray = listToArray(gleamList);
  return arrayToList(jsArray);
}

/**
 * Map JavaScript error to Gleam DatabaseError type
 * @param {Error} jsError - JavaScript error object
 * @returns {Object} DatabaseError structure
 */
export function mapDatabaseError(jsError) {
  return {
    message: jsError.message || String(jsError),
    code: jsError.code !== undefined ? new Some(jsError.code) : new None(),
    detail: jsError.detail !== undefined ? new Some(jsError.detail) : new None(),
    hint: jsError.hint !== undefined ? new Some(jsError.hint) : new None(),
  };
}

// ============================================================================
// Test Helper Functions
// ============================================================================

/**
 * Test helper: Verify Option(String) extracts correctly
 * @param {Object} gleamOption - Gleam Option(String)
 * @param {string} expected - Expected string value
 * @returns {boolean} True if extraction matches expected value
 */
export function testExtractOptionString(gleamOption, expected) {
  const extracted = gleamOption && gleamOption[0] !== undefined ? gleamOption[0] : undefined;
  return extracted === expected;
}

/**
 * Test helper: Verify Option is None
 * @param {Object} gleamOption - Gleam Option
 * @returns {boolean} True if it's None
 */
export function testIsNone(gleamOption) {
  const extracted = gleamOption && gleamOption[0] !== undefined ? gleamOption[0] : undefined;
  return extracted === undefined;
}

/**
 * Test helper: Create Some(42) and verify it can be unwrapped
 * @returns {Object} Gleam Some(42)
 */
export function testCreateSome42() {
  return new Some(42);
}

/**
 * Test helper: Verify Option(Int) contains expected value
 * @param {Object} gleamOption - Gleam Option(Int)
 * @param {number} expected - Expected number
 * @returns {boolean} True if value matches
 */
export function testOptionIntEquals(gleamOption, expected) {
  const extracted = gleamOption && gleamOption[0] !== undefined ? gleamOption[0] : undefined;
  return extracted === expected;
}

/**
 * Test helper: Create Gleam None
 * @returns {Object} Gleam None
 */
export function testCreateNone() {
  return new None();
}

/**
 * Test helper: Verify Config to JavaScript conversion
 * Returns the converted JavaScript object for inspection
 * @param {Object} gleamConfig - Gleam Config structure
 * @returns {Object} Converted JavaScript config object
 */
export function testConfigToJS(gleamConfig) {
  return configToJS(gleamConfig);
}

/**
 * Test helper: Create a DatabaseError from JavaScript error object
 * Used to test the error mapping function
 * @param {string} message - Error message
 * @param {boolean} hasCode - Whether to include error code
 * @param {boolean} hasDetail - Whether to include detail
 * @param {boolean} hasHint - Whether to include hint
 * @returns {Object} DatabaseError structure
 */
export function testCreateDatabaseError(message, hasCode, hasDetail, hasHint) {
  // Create a mock error object directly instead of using Error constructor
  const jsError = {
    message: message,
    code: hasCode ? "28P01" : undefined,
    detail: hasDetail ? "Password authentication failed" : undefined,
    hint: hasHint ? "Check your credentials" : undefined,
  };

  return mapDatabaseError(jsError);
}

/**
 * Test helper: Create a mock QueryResult with specified number of rows
 * @param {number} numRows - Number of rows to include
 * @param {string} command - SQL command (e.g., "SELECT", "INSERT")
 * @returns {Object} Gleam QueryResult structure
 */
export function testCreateQueryResult(numRows, command) {
  const rows = [];
  for (let i = 0; i < numRows; i++) {
    rows.push({ id: i + 1, name: `row${i + 1}` });
  }

  const mockPgResult = {
    rows: rows,
    rowCount: numRows,
    command: command,
    fields: [
      { name: 'id', tableID: 16384, columnID: 1, dataTypeID: 23 },
      { name: 'name', tableID: 16384, columnID: 2, dataTypeID: 25 },
    ],
  };

  return mapQueryResult(mockPgResult);
}

/**
 * Extract value from Gleam Option type
 * Gleam Option types: Some has value at [0], None has no value
 * @param {Object} opt - Gleam Option(a)
 * @returns {any|undefined} The unwrapped value or undefined
 */
function extractOption(opt) {
  // Check if it's a Some by checking if it has a value at index 0
  if (opt && opt[0] !== undefined) {
    return opt[0];
  }
  return undefined;
}

/**
 * Convert Gleam Config type to node-postgres config object
 * @param {Object} gleamConfig - Gleam Config structure
 * @returns {Object} node-postgres config object
 */
export function configToJS(gleamConfig) {
  return {
    user: extractOption(gleamConfig.user),
    password: extractOption(gleamConfig.password),
    host: extractOption(gleamConfig.host),
    port: extractOption(gleamConfig.port),
    database: extractOption(gleamConfig.database),
    connectionString: extractOption(gleamConfig.connection_string),
    ssl: extractOption(gleamConfig.ssl),
    types: extractOption(gleamConfig.types),
    statement_timeout: extractOption(gleamConfig.statement_timeout),
    query_timeout: extractOption(gleamConfig.query_timeout),
    lock_timeout: extractOption(gleamConfig.lock_timeout),
    application_name: extractOption(gleamConfig.application_name),
    connectionTimeoutMillis: extractOption(gleamConfig.connection_timeout_millis),
    keepAliveInitialDelayMillis: extractOption(gleamConfig.keep_alive_initial_delay_millis),
    idle_in_transaction_session_timeout: extractOption(gleamConfig.idle_in_transaction_session_timeout),
    client_encoding: extractOption(gleamConfig.client_encoding),
    fallback_application_name: extractOption(gleamConfig.fallback_application_name),
    options: extractOption(gleamConfig.options),
  };
}

// ============================================================================
// Client Management Functions
// ============================================================================

/**
 * Create a new PostgreSQL client instance (internal)
 * @param {Object} config - Gleam Config structure
 * @returns {Object} pg.Client instance (not wrapped in Gleam Client)
 */
export function createClientInternal(config) {
  const jsConfig = configToJS(config);
  const pgClient = new PgClient(jsConfig);

  // Return the raw pg.Client instance
  // The Gleam wrapper will construct Client(inner: pgClient)
  return pgClient;
}

/**
 * Connect to the PostgreSQL database
 * @param {Object} client - Gleam Client wrapper
 * @returns {Promise} Promise resolving to Result(Nil, DatabaseError)
 */
export async function connectClient(client) {
  try {
    // Extract the pg.Client from the Gleam wrapper
    const pgClient = client.inner;

    // Connect to the database
    await pgClient.connect();

    // Return Ok(undefined) - Gleam Nil is JavaScript undefined
    return new Ok(undefined);
  } catch (error) {
    // Map JavaScript error to DatabaseError and return Error
    return new Error(mapDatabaseError(error));
  }
}

/**
 * Close the database connection
 * @param {Object} client - Gleam Client wrapper
 * @returns {Promise} Promise resolving to Result(Nil, DatabaseError)
 */
export async function endClient(client) {
  try {
    // Extract the pg.Client from the Gleam wrapper
    const pgClient = client.inner;

    // Close the connection
    await pgClient.end();

    // Return Ok(undefined) - Gleam Nil is JavaScript undefined
    return new Ok(undefined);
  } catch (error) {
    // Map JavaScript error to DatabaseError and return Error
    return new Error(mapDatabaseError(error));
  }
}

// ============================================================================
// Query Execution Functions
// ============================================================================

/**
 * Execute a SQL query with parameters
 * @param {Object} client - Gleam Client wrapper
 * @param {string} sql - SQL query string with $1, $2, etc. placeholders
 * @param {Object} parameters - Gleam List of query parameters
 * @returns {Promise} Promise resolving to Result(QueryResult, DatabaseError)
 */
export async function executeQuery(client, sql, parameters) {
  try {
    // Extract the pg.Client from the Gleam wrapper
    const pgClient = client.inner;

    // Convert Gleam List to JavaScript Array
    const jsParams = listToArray(parameters);

    // Execute the query
    const result = await pgClient.query(sql, jsParams);

    // Map the result to Gleam QueryResult and return Ok
    return new Ok(mapQueryResult(result));
  } catch (error) {
    // Map JavaScript error to DatabaseError and return Error
    return new Error(mapDatabaseError(error));
  }
}

/**
 * Map node-postgres Result to Gleam QueryResult
 * @param {Object} pgResult - node-postgres query result
 * @returns {Object} Gleam QueryResult structure
 */
function mapQueryResult(pgResult) {
  return {
    rows: arrayToList(pgResult.rows),
    row_count: pgResult.rowCount !== null && pgResult.rowCount !== undefined
      ? new Some(pgResult.rowCount)
      : new None(),
    command: pgResult.command,
    fields: pgResult.fields && pgResult.fields.length > 0
      ? new Some(arrayToList(pgResult.fields.map(mapFieldInfo)))
      : new None(),
  };
}

/**
 * Map node-postgres field info to Gleam FieldInfo
 * @param {Object} pgField - node-postgres field metadata
 * @returns {Object} Gleam FieldInfo structure
 */
function mapFieldInfo(pgField) {
  return {
    name: pgField.name,
    table_id: pgField.tableID,
    column_id: pgField.columnID,
    data_type_id: pgField.dataTypeID,
  };
}

// ============================================================================
// Extended Mock Test Helpers for Mock-Only Test Suite
// ============================================================================

// ---------------------------------------------------------------------------
// 1. Connection Lifecycle Mocks
// ---------------------------------------------------------------------------

/**
 * Mock successful database connection
 * @returns {Object} Ok(undefined) - Gleam Result type
 */
export function testMockConnectSuccess() {
  return new Ok(undefined);
}

/**
 * Mock failed database connection with error code
 * @param {string} errorCode - PostgreSQL error code (e.g., "ECONNREFUSED")
 * @returns {Object} Error(DatabaseError) - Gleam Result type
 */
export function testMockConnectFailure(errorCode) {
  const mockError = {
    message: "Connection failed",
    code: errorCode,
    detail: "Could not establish database connection",
    hint: "Check host and port settings",
  };
  return new Error(mapDatabaseError(mockError));
}

/**
 * Mock successful connection close
 * @returns {Object} Ok(undefined) - Gleam Result type
 */
export function testMockEndSuccess() {
  return new Ok(undefined);
}

/**
 * Mock failed connection close
 * @returns {Object} Error(DatabaseError) - Gleam Result type
 */
export function testMockEndFailure() {
  const mockError = {
    message: "Failed to close connection",
    code: "CONNECTION_CLOSE_ERROR",
  };
  return new Error(mapDatabaseError(mockError));
}

// ---------------------------------------------------------------------------
// 2. Query Execution Mocks
// ---------------------------------------------------------------------------

/**
 * Mock successful query execution with specified row count
 * @param {number} rowCount - Number of rows to return
 * @param {string} command - SQL command (e.g., "SELECT", "INSERT")
 * @returns {Object} Ok(QueryResult) - Gleam Result type
 */
export function testMockQuerySuccess(rowCount, command) {
  const result = testCreateQueryResult(rowCount, command);
  return new Ok(result);
}

/**
 * Mock empty result set (0 rows)
 * @returns {Object} Ok(QueryResult) - Gleam Result type with 0 rows
 */
export function testMockEmptyResultSet() {
  const mockPgResult = {
    rows: [],
    rowCount: 0,
    command: "SELECT",
    fields: [
      { name: 'id', tableID: 16384, columnID: 1, dataTypeID: 23 },
    ],
  };
  return new Ok(mapQueryResult(mockPgResult));
}

/**
 * Mock failed query execution with error code
 * @param {string} errorCode - PostgreSQL error code (e.g., "42601")
 * @returns {Object} Error(DatabaseError) - Gleam Result type
 */
export function testMockQueryFailure(errorCode) {
  const mockError = {
    message: "Query execution failed",
    code: errorCode,
    detail: "SQL syntax error or constraint violation",
  };
  return new Error(mapDatabaseError(mockError));
}

/**
 * Mock query parameter validation
 * @param {Object} params - Gleam List of parameters
 * @returns {boolean} True if parameters can be converted to JS array
 */
export function testMockQueryParameterValidation(params) {
  try {
    const jsParams = listToArray(params);
    return Array.isArray(jsParams);
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// 3. Error Scenario Mocks (PostgreSQL-compliant error codes)
// ---------------------------------------------------------------------------

/**
 * Create connection error (ECONNREFUSED, timeout, etc.)
 * @param {string} message - Error message
 * @returns {Object} DatabaseError structure
 */
export function testCreateConnectionError(message) {
  const mockError = {
    message: message,
    code: "ECONNREFUSED",
    detail: "Connection refused by database server",
    hint: "Check if PostgreSQL is running and accepting connections",
  };
  return mapDatabaseError(mockError);
}

/**
 * Create SQL syntax error (PostgreSQL code: 42601)
 * @returns {Object} DatabaseError structure
 */
export function testCreateSyntaxError() {
  const mockError = {
    message: 'syntax error at or near "SELCT"',
    code: "42601",
    detail: "Invalid SQL syntax",
    hint: "Check your SQL statement for typos",
  };
  return mapDatabaseError(mockError);
}

/**
 * Create authentication error (PostgreSQL code: 28P01)
 * @returns {Object} DatabaseError structure
 */
export function testCreateAuthenticationError() {
  const mockError = {
    message: "password authentication failed for user \"testuser\"",
    code: "28P01",
    detail: "Password authentication failed",
    hint: "Verify username and password",
  };
  return mapDatabaseError(mockError);
}

/**
 * Create table not found error (PostgreSQL code: 42P01)
 * @returns {Object} DatabaseError structure
 */
export function testCreateTableNotFoundError() {
  const mockError = {
    message: 'relation "nonexistent_table" does not exist',
    code: "42P01",
    detail: "Table or view not found",
    hint: "Check table name spelling and schema",
  };
  return mapDatabaseError(mockError);
}

/**
 * Create unique constraint violation error (PostgreSQL code: 23505)
 * @returns {Object} DatabaseError structure
 */
export function testCreateUniqueViolationError() {
  const mockError = {
    message: 'duplicate key value violates unique constraint "users_email_key"',
    code: "23505",
    detail: 'Key (email)=(test@example.com) already exists.',
    hint: "Use a unique value for the constrained column",
  };
  return mapDatabaseError(mockError);
}

// ---------------------------------------------------------------------------
// 4. DML Result Structure Mocks
// ---------------------------------------------------------------------------

/**
 * Create mock INSERT result with row count
 * @param {number} rowCount - Number of rows inserted
 * @returns {Object} QueryResult structure
 */
export function testCreateInsertResult(rowCount) {
  const mockPgResult = {
    rows: [],
    rowCount: rowCount,
    command: "INSERT",
    fields: [],
  };
  return mapQueryResult(mockPgResult);
}

/**
 * Create mock UPDATE result with affected row count
 * @param {number} rowCount - Number of rows updated
 * @returns {Object} QueryResult structure
 */
export function testCreateUpdateResult(rowCount) {
  const mockPgResult = {
    rows: [],
    rowCount: rowCount,
    command: "UPDATE",
    fields: [],
  };
  return mapQueryResult(mockPgResult);
}

/**
 * Create mock DELETE result with deleted row count
 * @param {number} rowCount - Number of rows deleted
 * @returns {Object} QueryResult structure
 */
export function testCreateDeleteResult(rowCount) {
  const mockPgResult = {
    rows: [],
    rowCount: rowCount,
    command: "DELETE",
    fields: [],
  };
  return mapQueryResult(mockPgResult);
}

/**
 * Create mock CREATE TABLE result
 * @returns {Object} QueryResult structure
 */
export function testCreateCreateTableResult() {
  const mockPgResult = {
    rows: [],
    rowCount: null,
    command: "CREATE",
    fields: [],
  };
  return mapQueryResult(mockPgResult);
}

/**
 * Create mock DROP TABLE result
 * @returns {Object} QueryResult structure
 */
export function testCreateDropTableResult() {
  const mockPgResult = {
    rows: [],
    rowCount: null,
    command: "DROP",
    fields: [],
  };
  return mapQueryResult(mockPgResult);
}
