-- =====================================================================
-- TPCMS — proposed new tables
-- =====================================================================
-- These three tables do NOT exist in the current database and are not
-- referenced anywhere in backend/prisma/schema.prisma. They are provided
-- as-requested (SQL only) — running this file does not, by itself, wire
-- anything up:
--   1. The Prisma schema would still need a matching `model` block added
--      for each table (`npx prisma db pull` can regenerate it after you
--      run this SQL, or you can hand-write the models).
--   2. The backend would still need routes/controllers/validation for
--      each table before the frontend can read/write real data.
--   3. Until step 2 is done, the related frontend features keep working
--      exactly as they do today:
--        - Interview Scheduler: browser-local only (localStorage key
--          `company_interviews`), not synced across devices.
--        - Notices (announcement board): browser-local only
--          (localStorage key `tpcms_notice_board`).
--        - Student social/resume links: not collected anywhere yet.
--   Naming, key style (`_table` suffix, `_id` PK, `created_on`/
--   `updated_on` timestamps, `fk_<table>_<ref>` constraint names) matches
--   the existing schema so it drops in cleanly if you do wire it up later.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1) Interview scheduling
-- One row per interview scheduled against an existing, approved
-- placement application (placement_id + student_id must already exist
-- in placement_application_table — mirrors the current frontend rule
-- that only status_id = 2 "Approved" applicants can be scheduled).
-- ---------------------------------------------------------------------
CREATE TABLE `interview_schedule_table` (
  `interview_id`     INT NOT NULL AUTO_INCREMENT,
  `placement_id`     INT NOT NULL,
  `student_id`       INT NOT NULL,
  `scheduled_by`     INT NOT NULL,
  `interview_date`   DATE NOT NULL,
  `interview_time`   TIME NOT NULL,
  `mode`             ENUM('Online','Offline') NOT NULL DEFAULT 'Online',
  `meeting_link`     VARCHAR(255) NULL,
  `offline_location` VARCHAR(255) NULL,
  `notes`            TEXT NULL,
  `created_on`       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_on`       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`interview_id`),
  KEY `idx_interview_application` (`placement_id`, `student_id`),
  KEY `fk_interview_scheduler` (`scheduled_by`),
  CONSTRAINT `fk_interview_application` FOREIGN KEY (`placement_id`, `student_id`)
    REFERENCES `placement_application_table` (`placement_id`, `student_id`)
    ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_interview_scheduler` FOREIGN KEY (`scheduled_by`)
    REFERENCES `user_table` (`user_id`)
    ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ---------------------------------------------------------------------
-- 2) Student links (social/portfolio links used on the resume)
-- `link_type_table` is a master lookup (same pattern as skill_table /
-- category_table) so the "what is this link for" dropdown the student
-- picks from is admin-editable, not hardcoded.
-- ---------------------------------------------------------------------
CREATE TABLE `link_type_table` (
  `link_type_id` INT NOT NULL AUTO_INCREMENT,
  `link_type`    VARCHAR(100) NOT NULL,
  PRIMARY KEY (`link_type_id`),
  UNIQUE KEY `uq_link_type` (`link_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `link_type_table` (`link_type`) VALUES
  ('LinkedIn'),
  ('GitHub'),
  ('Portfolio'),
  ('LeetCode'),
  ('Personal Website'),
  ('Other');

CREATE TABLE `student_link_table` (
  `link_id`      INT NOT NULL AUTO_INCREMENT,
  `student_id`   INT NOT NULL,
  `link_type_id` INT NOT NULL,
  `url`          VARCHAR(255) NOT NULL,
  `created_on`   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`link_id`),
  KEY `fk_student_link_student` (`student_id`),
  KEY `fk_student_link_type` (`link_type_id`),
  CONSTRAINT `fk_student_link_student` FOREIGN KEY (`student_id`)
    REFERENCES `student_table` (`user_id`)
    ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_student_link_type` FOREIGN KEY (`link_type_id`)
    REFERENCES `link_type_table` (`link_type_id`)
    ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ---------------------------------------------------------------------
-- 3) Notices (text announcement board — distinct from note_table,
-- which is file/study-material sharing). `department_id` is nullable:
-- NULL = visible to everyone, set = scoped to one department.
-- ---------------------------------------------------------------------
CREATE TABLE `notice_table` (
  `notice_id`     INT NOT NULL AUTO_INCREMENT,
  `creator_id`    INT NOT NULL,
  `title`         VARCHAR(255) NOT NULL,
  `message`       TEXT NOT NULL,
  `department_id` INT NULL,
  `is_active`     BOOLEAN NOT NULL DEFAULT TRUE,
  `created_on`    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_on`    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`notice_id`),
  KEY `fk_notice_creator` (`creator_id`),
  KEY `fk_notice_department` (`department_id`),
  CONSTRAINT `fk_notice_creator` FOREIGN KEY (`creator_id`)
    REFERENCES `user_table` (`user_id`)
    ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_notice_department` FOREIGN KEY (`department_id`)
    REFERENCES `department_table` (`department_id`)
    ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
