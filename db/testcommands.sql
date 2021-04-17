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

CREATE TRIGGER createRouteTrigger
AFTER INSERT ON LeaveApplication
FOR EACH ROW EXECUTE PROCEDURE createRoute();



SELECT EID FROM SpecialDesignation 
    WHERE designation = 'HOD' 
    AND type_or_dept IN (SELECT deptName::text FROM Employee WHERE EID = 8);

INSERT INTO LeaveApplication(EID, type, leaveStartDate, leaveEndDate, content)
            Values(10, 'Normal', '2021-04-15 18:52:31.041565+05:30', '2021-05-15 18:52:31.041565+05:30', 'even hi');


CREATE OR REPLACE FUNCTION validateSpecialDesignation()
RETURNS TRIGGER AS $$
    DECLARE ;
    BEGIN
    END;
$$ LANGUAGE plpgsql;