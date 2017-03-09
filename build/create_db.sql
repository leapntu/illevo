--
-- File generated with SQLiteStudio v3.1.1 on Mon Mar 6 17:04:19 2017
--
-- Text encoding used: UTF-8
--
PRAGMA foreign_keys = off;
BEGIN TRANSACTION;

-- Table: dataevents
CREATE TABLE dataevents (id INTEGER PRIMARY KEY AUTOINCREMENT, user INTEGER REFERENCES users (id), time NUMERIC, lineage INTEGER, generation INTEGER);

-- Table: language
CREATE TABLE language (id INTEGER PRIMARY KEY, dataevent INTEGER REFERENCES dataevents (id), stimuli INTEGER REFERENCES stimuli (id), word TEXT);

-- Table: lineage
CREATE TABLE lineage (id INTEGER PRIMARY KEY AUTOINCREMENT, condition TEXT, generation INTEGER, open INTEGER);

-- Table: stimuli
CREATE TABLE stimuli (id INTEGER PRIMARY KEY, shape TEXT, color TEXT, motion TEXT);

-- Table: users
CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, login TEXT, pwd TEXT, consent INTEGER, gender TEXT, age INTEGER, email TEXT, native TEXT, second TEXT);

COMMIT TRANSACTION;
PRAGMA foreign_keys = on;
