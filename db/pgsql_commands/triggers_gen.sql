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
        directoEID int;

    BEGIN
        -- finding director
        SELECT EID FROM SpecialDesignation 
            WHERE designation = 'Director' 
            INTO directoEID;

        -- finding HOD
        SELECT EID FROM SpecialDesignation 
            WHERE designation = 'HOD' 
            AND type_or_dept = (SELECT deptName::text FROM Employee WHERE EID = _EID)
            INTO hodEID;

        -- finding Dean
        SELECT EID FROM SpecialDesignation 
            WHERE designation = 'Dean' 
            AND type_or_dept = 'DeanFacultyAffairs'
            INTO deanEID;

        IF _type = 'Special'::LeaveApplicationType THEN
            INSERT INTO LeaveRoute(LID, position, checkerEID) 
                VALUES(_LID, 1, directoEID);
        ELSE
            IF _type = 'Retrospective'::LeaveApplicationType THEN
                INSERT INTO LeaveRoute(LID, position, checkerEID) 
                    VALUES
                        (_LID, 1, hodEID),
                        (_LID, 2, deanEID),
                        (_LID, 3, directoEID);
            ELSE
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
