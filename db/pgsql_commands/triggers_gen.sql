-- IMP NOTE:
-- triggers are executed in alphabetical order!

-- trigger to create entry in ApplicationLock when new employee is added:
CREATE OR REPLACE FUNCTION applicationLockCreator()
RETURNS TRIGGER AS $$
    BEGIN
        INSERT INTO ApplicationRowLock(EID, isLALocked) VALUES(NEW.eid, FALSE);
        RETURN NEW;
    END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER applicationLockCreatorTrigger
AFTER INSERT ON Employee
FOR EACH ROW EXECUTE PROCEDURE applicationLockCreator();
    

-- Trigger to create ROUTE when new aplication is added:
--  if special_designation:
--      find director
--      create route: director
--  else:
--      find HOD
--      find dean
--      if restrospective:
--          find director
--          create route: HOD->dean->director
--      else
--          create route: HOD->dean

CREATE OR REPLACE FUNCTION createRoute() 
RETURNS TRIGGER AS $$
    DECLARE 
        _LID int := NEW.LID;
        _EID int := NEW.EID;
        _type LeaveApplicationType := NEW.type;

        _deptName varchar;

    BEGIN

        SELECT deptName::text FROM Employee 
            WHERE EID = _EID
            INTO _deptName;
        
        IF _type = 'Special'::LeaveApplicationType THEN
            INSERT INTO LeaveRoute(LID, position, designation, type_or_dept)
                VALUES(_LID, 1, 'Director', 'Director');
        ELSE
            IF _type = 'Retrospective'::LeaveApplicationType THEN
                INSERT INTO LeaveRoute(LID, position, designation, type_or_dept) 
                    VALUES
                        (_LID, 1, 'HOD', _deptName),
                        (_LID, 2, 'Dean', 'DeanFacultyAffairs'),
                        (_LID, 3, 'Director', 'Director');
            ELSE
                INSERT INTO LeaveRoute(LID, position, designation, type_or_dept) 
                    VALUES
                        (_LID, 1, 'HOD', _deptName),
                        (_LID, 2, 'Dean', 'DeanFacultyAffairs');
            END IF;
        END IF;
        RETURN NEW;
    END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER createRouteTrigger
AFTER INSERT ON LeaveApplication
FOR EACH ROW EXECUTE PROCEDURE createRoute();



-- Trigger to validate SpecialDesignation
CREATE OR REPLACE FUNCTION validateSpecialDesignation()
RETURNS TRIGGER AS $$
    DECLARE 
        duplicates int;
        countOfSpecialDesig int;
        maxStartDateForNewDesignation timestamp;
        department varchar;
    BEGIN
        -- Trivial constraint
        IF NEW.startDate >= NEW.endDate THEN 
            RAISE EXCEPTION 'Error: End date should be after start date';
        END IF;

        -- CONSTRAINT: to prevent duplicate inputs
        SELECT count(*) FROM SpecialDesignation 
            WHERE
                eid = NEW.eid
                AND designation = NEW.designation
                AND type_or_dept = NEW.type_or_dept
                AND startDate = NEW.startDate
                AND endDate = NEW.endDate
            INTO duplicates;
        
        IF duplicates > 0 THEN 
            RAISE EXCEPTION 'Error: Entry already exists!';
        END IF;

        -- CONSTRAINT: Employee can't be HOD of different department
        IF NEW.designation = 'HOD' THEN
            SELECT deptName from Employee
                WHERE eid = NEW.eid
            INTO department;
            IF NEW.type_or_dept <> department THEN
                RAISE EXCEPTION 'Error: Faculty of % department can''t be HOD of % department',department, NEW.type_or_dept;
            END IF;
        END IF;
        
        -- CONSTRAINT: An employee cannot have 2 special designations!
        SELECT count(*) FROM SpecialDesignation
            WHERE 
                eid = NEW.eid
                AND endDate > NEW.startDate
            INTO countOfSpecialDesig;

        IF countOfSpecialDesig > 0 THEN 
            RAISE EXCEPTION 'Error: Cannot assign new designation until previous one is terminated!';
        END IF;
        
        -- CONSTRAINT: A designation startDate must be after any previous startDate!
        --              This allows us to reduce the ending time of pervious ones whenever new designation is added
        --              That is done in decreasePendingDesignations()
        SELECT max(startDate) FROM SpecialDesignation
            WHERE 
                designation = NEW.designation
                AND type_or_dept = New.type_or_dept
            INTO maxStartDateForNewDesignation;

        IF maxStartDateForNewDesignation > NEW.startDate THEN 
            RAISE EXCEPTION 'Error: For a given designation, start date should be after the start date of all previously assigned employee!';
        END IF;
        
        RETURN NEW;
    END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger01_validateSpecialDesignationTrigger
BEFORE INSERT ON SpecialDesignation
FOR EACH ROW EXECUTE PROCEDURE validateSpecialDesignation();



-- Another BEFORE trigger: 
-- to decrease endDate to the startDate of New designation (if not already less or equal)
CREATE OR REPLACE FUNCTION decreasePendingDesignations()
RETURNS TRIGGER AS $$
    BEGIN
        UPDATE SpecialDesignation
        SET endDate = NEW.startDate
        WHERE
            designation = NEW.designation
            AND type_or_dept = New.type_or_dept
            AND endDate > NEW.startdate;
        
        RETURN NEW;
    END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger02_decreasePendingDesignationsTrigger
BEFORE INSERT ON SpecialDesignation
FOR EACH ROW EXECUTE PROCEDURE decreasePendingDesignations();

