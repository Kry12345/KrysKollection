/* To view all triggers in the database, you can use the following SQL query: */
/*
SELECT name, sql
FROM sqlite_master
WHERE type = 'trigger';
*/

/*INSERT INTO collectionCard (id, quantity) VALUES
('sv03.5-152', 1),
('sv03.5-153', 1),
('sv03.5-154', 1),
('sv03.5-155', 1),
('sv03.5-156', 1),
('sv03.5-157', 1),
('sv03.5-158', 1),
('sv03.5-160', 1),
('sv03.5-161', 1),
('sv03.5-163', 1),
('sv03.5-164', 1),
('sv03.5-165', 1),
('sv03.5-168', 1),
('sv03.5-169', 1),
('sv03.5-171', 1),
('sv03.5-172', 1),
('sv03.5-174', 1),
('sv03.5-175', 1),
('sv03.5-177', 1),
('sv03.5-178', 1),
('sv03.5-179', 1),
('sv03.5-181', 1),
('sv03.5-184', 1),
('sv03.5-185', 1),
('sv03.5-190', 1),
('sv03.5-194', 1),
('sv03.5-195', 1),
('sv03.5-199', 1),
('sv03.5-202', 1),
('sv03.5-203', 1),
('sv03.5-206', 1),
('sv03.5-207', 1);*/

ALTER TABLE collectionCard
ADD COLUMN reverse_quantity INTEGER;

/*
CREATE TRIGGER update_collectionCard_updated_at
AFTER UPDATE ON collectionCard
FOR EACH ROW
BEGIN
    UPDATE collectionCard
    SET updated_at = CURRENT_TIMESTAMP
    WHERE id = OLD.id;
END;
*/

/*
CREATE TABLE collectionCard (
    id VARCHAR(10) PRIMARY KEY,
    quantity INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
*/
