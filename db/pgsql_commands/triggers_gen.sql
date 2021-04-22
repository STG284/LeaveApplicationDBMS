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
    

-- Trigger to create only the first entry for the ROUTE when new aplication is added:
--  if special_designation:
--      find director
--      create route: director
--  else:
--      find HOD
--      find dean
--      if restrospective:
--          find director
--          create route: HOD (->dean->director : will be created by updateApplicationStatus())
--      else
--          create route: HOD (->dean : will be created by updateApplicationStatus())

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
                        (_LID, 1, 'HOD', _deptName);
                        -- (_LID, 2, 'Dean', 'DeanFacultyAffairs'),
                        -- (_LID, 3, 'Director', 'Director');
            ELSE
                INSERT INTO LeaveRoute(LID, position, designation, type_or_dept) 
                    VALUES
                        (_LID, 1, 'HOD', _deptName);
                        -- (_LID, 2, 'Dean', 'DeanFacultyAffairs');
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
                RAISE EXCEPTION 'Error: Faculty of % department can''t be HOD of % department', department, NEW.type_or_dept;
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

CREATE TRIGGER trigger02_validateSpecialDesignationTrigger
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

CREATE TRIGGER trigger01_decreasePendingDesignationsTrigger
BEFORE INSERT ON SpecialDesignation
FOR EACH ROW EXECUTE PROCEDURE decreasePendingDesignations();


-- Before Trigger to validate new entry in ApplicationEvent
CREATE OR REPLACE FUNCTION validateApplicationEvent()
RETURNS TRIGGER AS $$
    DECLARE
        isChecker bool;
        applicantEID int;
        hodEID int;
        deanEID int;
        directorEID int;
        _previousState LeaveStatus;
    BEGIN
        -- finding applicant
        SELECT EID FROM LeaveApplication 
            WHERE LID = NEW.LID
            INTO applicantEID;

        -- finding director
        SELECT EID FROM SpecialDesignation 
            WHERE designation = 'Director' 
            AND startDate <= now() 
            AND endDate > now()
            INTO directorEID;

        -- finding HOD
        SELECT EID FROM SpecialDesignation 
            WHERE designation = 'HOD' 
            AND type_or_dept = (SELECT deptName::text FROM Employee WHERE EID = applicantEID)
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

        IF NEW.byEID <> applicantEID 
            AND NEW.byEID <> hodEID 
            AND NEW.byEID <> deanEID
            AND NEW.byEID <> directorEID
            AND NEW.byEID <> -1 THEN
            RAISE EXCEPTION 'Not authorised to set any event!';
        END IF;

        RAISE NOTICE 'h1';

        IF 
            -- if person checker, status allowed are: 'approved', 'rejected', 'terminated'
            --  applicant can only set as 'pending'
            (applicantEID = NEW.byEID AND NEW.newStatus <> 'pending') 
            OR (NEW.byEID <> applicantEID AND New.newStatus = 'pending')

            -- systemTerminated reserved for system!
            OR (NEW.byEID = -1 AND New.newStatus <> 'systemTerminated')
            OR (NEW.byEID <> -1 AND New.newStatus = 'systemTerminated')
        THEN
            RAISE EXCEPTION 'Not authorised to set event "%" !', NEW.newStatus;
        END IF;

        RAISE NOTICE 'h2';

        -- Get status of previous latest ApplicationEvent for this LID
        SELECT newStatus FROM ApplicationEvent
            WHERE LID = NEW.LID
            AND time = 
                (SELECT max(time) FROM ApplicationEvent
                    WHERE LID = NEW.LID)
            INTO _previousState;
        
        -- IF _previousState = New.newStatus THEN
        --     RAISE EXCEPTION 'Cannot set state % again!', _previousState;
        -- END IF;
        RAISE NOTICE 'h3';
        
        RETURN NEW;
    END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger01_validateApplicationEvent
BEFORE INSERT ON ApplicationEvent
FOR EACH ROW EXECUTE PROCEDURE validateApplicationEvent();


-- After trigger to automatically update status in LeaveApplication as new ApplicationEvent is added
CREATE OR REPLACE FUNCTION updateApplicationStatus()
RETURNS TRIGGER AS $$
    DECLARE 
        _leaveApplication LeaveApplication;
        _curRoutePosition int; -- current route position
        _nextLeaveRoute LeaveRoute;
        _currentNoOfLeaves int;
        _usedLeaves int;
    BEGIN
        
        SELECT * FROM LeaveApplication 
                WHERE LID = NEW.LID
                INTO _leaveApplication;
                
        -- adding new route if required!
        IF NEW.newStatus = 'approved' THEN

            -- update the status of last route:
            UPDATE LeaveRoute
                SET isApproved = TRUE
                WHERE LID = NEW.LID 
                    AND position = _curRoutePosition;
            
            -- the last completed position in ApplicationRoute for this application
            SELECT MAX(position) FROM LeaveRoute
                WHERE LID = NEW.LID
                INTO _curRoutePosition;
            
            CASE _curRoutePosition
                WHEN 1 THEN
                    IF _leaveApplication.type <> 'Special' THEN
                        _nextLeaveRoute := (NEW.LID, 2, 'Dean', 'DeanFacultyAffairs', FALSE);
                    END IF;
                WHEN 2 THEN
                    IF _leaveApplication.type = 'Retrospective' THEN
                        _nextLeaveRoute := (NEW.LID, 3, 'Director', 'Director', FALSE);
                    END IF;
            END CASE;
            
            -- RAISE NOTICE '_nextLeaveRoute: % ', _nextLeaveRoute;
            -- RAISE NOTICE '_nextLeaveRoute IS NULL: % ', _nextLeaveRoute IS NULL;
            -- RAISE NOTICE '_nextLeaveRoute IS NOT NULL: % ', _nextLeaveRoute IS NOT NULL;

            -- NOTE: evaluates to true only if all columns evaluates to true!
            IF _nextLeaveRoute IS NOT NULL THEN

                INSERT INTO LeaveRoute(LID, position, designation, type_or_dept, isApproved) 
                    VALUES(_nextLeaveRoute.LID, 
                            _nextLeaveRoute.position,
                            _nextLeaveRoute.designation, 
                            _nextLeaveRoute.type_or_dept,
                            _nextLeaveRoute.isApproved);
                
                -- resetting the status to pending and returning!
                UPDATE LeaveApplication
                    SET status = 'pending'
                    WHERE LID = NEW.LID;

                RETURN NEW;

            END IF;
        END IF;

        -- control reaches here only if "NO NEW ROUTE" were added
        
        -- reduce leaves from employee account
        IF NEW.newStatus = 'approved' THEN
            SELECT leavesRemaining FROM Employee
                WHERE EID = _leaveApplication.EID
                INTO _currentNoOfLeaves;
            
            SELECT (_leaveApplication.leaveEndDate::date - _leaveApplication.leaveStartDate::date)
                INTO _usedLeaves;

            IF _currentNoOfLeaves < _usedLeaves THEN
                RAISE EXCEPTION 'Number of leaves are more than that allowed for this user for this year!';
            END IF;

            UPDATE Employee
                SET leavesRemaining = leavesRemaining - _usedLeaves
                WHERE EID = _leaveApplication.EID;
        END IF;

        -- if the leave is retrospectuve and terminated, add leaves in penaltyleaves
        IF (NEW.newStatus = 'terminated' AND _leaveApplication.leaveStartDate <= now()) THEN
            SELECT (_leaveApplication.leaveEndDate::date - _leaveApplication.leaveStartDate::date)
                INTO _usedLeaves;

            UPDATE Employee
                SET penaltyLeaves = penaltyLeaves + _usedLeaves
                WHERE EID = _leaveApplication.EID;
        END IF;

        -- everything is okay, leave is approved
        UPDATE LeaveApplication
            SET status = NEW.newStatus
            WHERE LID = NEW.LID;

        RETURN NEW;
    END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger01_updateApplicationStatus
AFTER INSERT ON ApplicationEvent
FOR EACH ROW EXECUTE PROCEDURE updateApplicationStatus();

