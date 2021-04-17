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

        hodEID int;
        deanEID int;
        directorEID int;

    BEGIN
        -- finding director
        SELECT EID FROM SpecialDesignation 
            WHERE designation = 'Director' 
            AND startDate <= now() 
            AND endDate > now()
            INTO directorEID;

        -- finding HOD
        SELECT EID FROM SpecialDesignation 
            WHERE designation = 'HOD' 
            AND type_or_dept = (SELECT deptName::text FROM Employee WHERE EID = _EID)
            AND startDate <= now() 
            AND endDate > now()
            INTO hodEID;

        -- finding Dean
        SELECT EID FROM SpecialDesignation 
            WHERE designation = 'Dean' 
            AND type_or_dept = 'DeanFacultyAffairs'
            AND startDate <= now() 
            AND endDate > now()
            INTO deanEID;

        IF _type = 'Special'::LeaveApplicationType THEN
            IF directorEID IS NULL THEN
                RAISE EXCEPTION 'Failed to create New LeaveApplication because: No Director exists!';
            END IF;

            INSERT INTO LeaveRoute(LID, position, checkerEID) 
                VALUES(_LID, 1, directorEID);
        ELSE
            IF _type = 'Retrospective'::LeaveApplicationType THEN
                IF hodEID IS NULL THEN
                    RAISE EXCEPTION 'Failed to create New LeaveApplication because: No HOD exists!';
                END IF;
                IF deanEID IS NULL THEN
                    RAISE EXCEPTION 'Failed to create New LeaveApplication because: No Dean exists!';
                END IF;
                IF directorEID IS NULL THEN
                    RAISE EXCEPTION 'Failed to create New LeaveApplication because: No Director exists!';
                END IF;
                INSERT INTO LeaveRoute(LID, position, checkerEID) 
                    VALUES
                        (_LID, 1, hodEID),
                        (_LID, 2, deanEID),
                        (_LID, 3, directorEID);
            ELSE
                IF hodEID IS NULL THEN
                    RAISE EXCEPTION 'Failed to create New LeaveApplication because: No HOD exists!';
                END IF;
                IF deanEID IS NULL THEN
                    RAISE EXCEPTION 'Failed to create New LeaveApplication because: No Dean exists!';
                END IF;
                INSERT INTO LeaveRoute(LID, position, checkerEID) 
                    VALUES
                        (_LID, 1, hodEID),
                        (_LID, 2, deanEID);
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
        countOfSpecialDesig int;
        maxStartDateForNewDesignation timestamp;
    BEGIN
        -- Trivial constraint
        IF NEW.startDate > NEW.endDate THEN 
            RAISE EXCEPTION 'Error: End date should be after start date';
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

CREATE TRIGGER validateSpecialDesignationTrigger
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

CREATE TRIGGER decreasePendingDesignationsTrigger
BEFORE INSERT ON SpecialDesignation
FOR EACH ROW EXECUTE PROCEDURE decreasePendingDesignations();