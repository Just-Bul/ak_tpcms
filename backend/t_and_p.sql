-- Create Database and Switch Context
CREATE DATABASE IF NOT EXISTS `t_and_p` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `t_and_p`;

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- --------------------------------------------------------
-- 1. Drop Existing Tables (Clean Setup)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `alumni_table`;
DROP TABLE IF EXISTS `interview_schedule_table`;
DROP TABLE IF EXISTS `student_document_table`;
DROP TABLE IF EXISTS `student_link_table`;
DROP TABLE IF EXISTS `student_skill_table`;
DROP TABLE IF EXISTS `student_table`;
DROP TABLE IF EXISTS `organization_table`;
DROP TABLE IF EXISTS `placement_application_table`;
DROP TABLE IF EXISTS `placement_category_table`;
DROP TABLE IF EXISTS `placement_department_table`;
DROP TABLE IF EXISTS `placement_semester_table`;
DROP TABLE IF EXISTS `placement_table`;
DROP TABLE IF EXISTS `training_application_table`;
DROP TABLE IF EXISTS `training_department_table`;
DROP TABLE IF EXISTS `training_semester_table`;
DROP TABLE IF EXISTS `training_table`;
DROP TABLE IF EXISTS `note_table`;
DROP TABLE IF EXISTS `notice_table`;
DROP TABLE IF EXISTS `department_table`;
DROP TABLE IF EXISTS `user_table`;
DROP TABLE IF EXISTS `role_table`;
DROP TABLE IF EXISTS `sector_table`;
DROP TABLE IF EXISTS `status_table`;
DROP TABLE IF EXISTS `category_table`;
DROP TABLE IF EXISTS `division_table`;
DROP TABLE IF EXISTS `gender_table`;
DROP TABLE IF EXISTS `semester_table`;
DROP TABLE IF EXISTS `skill_table`;
DROP TABLE IF EXISTS `link_type_table`;

SET FOREIGN_KEY_CHECKS = 1;

-- --------------------------------------------------------
-- 2. Master Lookups Schema & Seed Data
-- --------------------------------------------------------

-- Role Master Table
CREATE TABLE `role_table` (
  `role_id` int(11) NOT NULL AUTO_INCREMENT,
  `role` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `uq_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `role_table` (`role_id`, `role`) VALUES
(1, 'Super Admin'),
(2, 'Student'),
(3, 'Coordinator'),
(4, 'Organization');

-- Gender Master Table
CREATE TABLE `gender_table` (
  `gender_id` int(11) NOT NULL AUTO_INCREMENT,
  `gender` varchar(255) NOT NULL,
  PRIMARY KEY (`gender_id`),
  UNIQUE KEY `uq_gender` (`gender`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `gender_table` (`gender_id`, `gender`) VALUES
(1, 'Female'),
(2, 'Male'),
(3, 'Others');

-- Division Master Table
CREATE TABLE `division_table` (
  `division_id` int(11) NOT NULL AUTO_INCREMENT,
  `division` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`division_id`),
  UNIQUE KEY `uq_division` (`division`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `division_table` (`division_id`, `division`) VALUES
(1, 'First'),
(2, 'Second'),
(3, 'Third');

-- Category Master Table
CREATE TABLE `category_table` (
  `category_id` int(11) NOT NULL AUTO_INCREMENT,
  `category` varchar(255) NOT NULL,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `uq_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `category_table` (`category_id`, `category`) VALUES
(1, 'GENERAL'),
(2, 'EWS'),
(3, 'OBC-NCL'),
(4, 'SC'),
(5, 'ST');

-- Status Master Table
CREATE TABLE `status_table` (
  `status_id` int(11) NOT NULL AUTO_INCREMENT,
  `status` varchar(255) NOT NULL,
  PRIMARY KEY (`status_id`),
  UNIQUE KEY `uq_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `status_table` (`status_id`, `status`) VALUES
(1, 'Pending'),
(2, 'Approved'),
(3, 'Rejected');

-- Semester Master Table
CREATE TABLE `semester_table` (
  `semester_id` int(11) NOT NULL AUTO_INCREMENT,
  `semester` varchar(255) NOT NULL,
  PRIMARY KEY (`semester_id`),
  UNIQUE KEY `uq_semester` (`semester`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `semester_table` (`semester_id`, `semester`) VALUES
(1, 'First'),
(2, 'Second'),
(3, 'Third'),
(4, 'Fourth'),
(5, 'Fifth'),
(6, 'Sixth'),
(7, 'Seventh'),
(8, 'Eighth');

-- Sector Master Table
CREATE TABLE `sector_table` (
  `sector_id` int(11) NOT NULL AUTO_INCREMENT,
  `sector_name` varchar(100) NOT NULL,
  `sector_shorthand` varchar(5) NOT NULL,
  PRIMARY KEY (`sector_id`),
  UNIQUE KEY `sector_shorthand` (`sector_shorthand`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `sector_table` (`sector_id`, `sector_name`, `sector_shorthand`) VALUES
(1, 'Information Technology', 'IT'),
(2, 'Health Care', 'HC'),
(3, 'Financials', 'FIN'),
(4, 'Consumer Discretionary', 'CD'),
(5, 'Consumer Staples', 'CS'),
(6, 'Communication Services', 'COMM'),
(7, 'Industrials', 'IND'),
(8, 'Energy', 'ENR'),
(9, 'Materials', 'MAT'),
(10, 'Utilities', 'UTIL'),
(11, 'Real Estate', 'RE');

-- Link Type Master Table
CREATE TABLE `link_type_table` (
  `link_type_id` int(11) NOT NULL AUTO_INCREMENT,
  `link_type` varchar(100) NOT NULL,
  PRIMARY KEY (`link_type_id`),
  UNIQUE KEY `uq_link_type` (`link_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `link_type_table` (`link_type_id`, `link_type`) VALUES
(1, 'LinkedIn'),
(2, 'GitHub'),
(3, 'Portfolio'),
(4, 'LeetCode'),
(5, 'Personal Website'),
(6, 'Other');

-- Skill Master Table
CREATE TABLE `skill_table` (
  `skill_id` int(11) NOT NULL AUTO_INCREMENT,
  `skill` varchar(255) NOT NULL,
  PRIMARY KEY (`skill_id`),
  UNIQUE KEY `uq_skill` (`skill`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- 3. Core System Schema
-- --------------------------------------------------------

-- User Table
CREATE TABLE `user_table` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `role_id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `auth_token` varchar(255) DEFAULT NULL,
  `mobile_no` varchar(255) DEFAULT NULL,
  `created_on` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_on` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_login` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `uq_mobile` (`mobile_no`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `user_table_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `role_table` (`role_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Department Table
CREATE TABLE `department_table` (
  `department_id` int(11) NOT NULL AUTO_INCREMENT,
  `department_name` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `coordinator_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`department_id`),
  UNIQUE KEY `department_name` (`department_name`),
  KEY `fk_department_coordinator` (`coordinator_id`),
  CONSTRAINT `fk_department_coordinator` FOREIGN KEY (`coordinator_id`) REFERENCES `user_table` (`user_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Student Table
CREATE TABLE `student_table` (
  `user_id` int(11) NOT NULL,
  `roll_no` varchar(255) NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `semester_id` int(11) DEFAULT 1,
  `department_id` int(11) DEFAULT NULL,
  `gender_id` int(11) DEFAULT NULL,
  `cgpa` decimal(4,2) DEFAULT NULL CHECK (`cgpa` >= 0 and `cgpa` <= 10.00),
  `tenth_division_id` int(11) DEFAULT NULL,
  `twelfth_division_id` int(11) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `has_backlog` tinyint(1) DEFAULT 0,
  `is_graduate` tinyint(1) DEFAULT 0,
  `category_id` int(11) DEFAULT 1,
  `resume_url` varchar(255) DEFAULT NULL,
  `graduation` tinyint(1) DEFAULT 0,
  `graduation_year` int(11) DEFAULT NULL,
  `grade_card_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `roll_no` (`roll_no`),
  KEY `semester_id` (`semester_id`),
  KEY `department_id` (`department_id`),
  KEY `gender_id` (`gender_id`),
  KEY `tenth_division_id` (`tenth_division_id`),
  KEY `twelfth_division_id` (`twelfth_division_id`),
  KEY `fk_category` (`category_id`),
  CONSTRAINT `fk_category` FOREIGN KEY (`category_id`) REFERENCES `category_table` (`category_id`) ON UPDATE CASCADE,
  CONSTRAINT `student_table_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user_table` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `student_table_ibfk_2` FOREIGN KEY (`semester_id`) REFERENCES `semester_table` (`semester_id`),
  CONSTRAINT `student_table_ibfk_3` FOREIGN KEY (`department_id`) REFERENCES `department_table` (`department_id`),
  CONSTRAINT `student_table_ibfk_4` FOREIGN KEY (`gender_id`) REFERENCES `gender_table` (`gender_id`),
  CONSTRAINT `student_table_ibfk_5` FOREIGN KEY (`tenth_division_id`) REFERENCES `division_table` (`division_id`),
  CONSTRAINT `student_table_ibfk_6` FOREIGN KEY (`twelfth_division_id`) REFERENCES `division_table` (`division_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Organization Table
CREATE TABLE `organization_table` (
  `user_id` int(11) NOT NULL,
  `approval_id` int(11) DEFAULT 1,
  `document_url` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `remarks` text DEFAULT NULL,
  `sector_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  KEY `approval_id` (`approval_id`),
  KEY `fk_organization_sector` (`sector_id`),
  CONSTRAINT `fk_organization_sector` FOREIGN KEY (`sector_id`) REFERENCES `sector_table` (`sector_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `organization_table_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user_table` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `organization_table_ibfk_2` FOREIGN KEY (`approval_id`) REFERENCES `status_table` (`status_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Alumni Table
CREATE TABLE `alumni_table` (
  `alumni_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `passing_year` int(11) NOT NULL,
  `current_company` varchar(255) DEFAULT NULL,
  `designation` varchar(255) DEFAULT NULL,
  `created_on` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_on` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`alumni_id`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `idx_alumni_passing_year` (`passing_year`),
  CONSTRAINT `fk_alumni_student` FOREIGN KEY (`user_id`) REFERENCES `student_table` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Placement Table
CREATE TABLE `placement_table` (
  `placement_id` int(11) NOT NULL AUTO_INCREMENT,
  `creator_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `min_cgpa` decimal(4,2) DEFAULT NULL CHECK (`min_cgpa` >= 0 and `min_cgpa` <= 10.00),
  `min_tenth_division_id` int(11) DEFAULT NULL,
  `min_twelfth_division_id` int(11) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `has_backlog` tinyint(1) DEFAULT NULL,
  `salary_lower` int(11) DEFAULT NULL,
  `salary_upper` int(11) DEFAULT NULL,
  `created_on` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_on` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_date_of_submission` date DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `start_date` date NOT NULL DEFAULT curdate(),
  `end_date` date NOT NULL DEFAULT (curdate() + interval 15 day),
  PRIMARY KEY (`placement_id`),
  KEY `creator_id` (`creator_id`),
  KEY `min_tenth_division_id` (`min_tenth_division_id`),
  KEY `min_twelfth_division_id` (`min_twelfth_division_id`),
  CONSTRAINT `placement_table_ibfk_1` FOREIGN KEY (`creator_id`) REFERENCES `user_table` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `placement_table_ibfk_2` FOREIGN KEY (`min_tenth_division_id`) REFERENCES `division_table` (`division_id`),
  CONSTRAINT `placement_table_ibfk_3` FOREIGN KEY (`min_twelfth_division_id`) REFERENCES `division_table` (`division_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Placement M2M Tables
CREATE TABLE `placement_application_table` (
  `placement_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `status_id` int(11) DEFAULT 1,
  `date_of_submission` date DEFAULT curdate(),
  `remarks` text DEFAULT NULL,
  `verified_by` int(11) DEFAULT NULL,
  `verified_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`placement_id`,`student_id`),
  KEY `placement_id` (`placement_id`),
  KEY `student_id` (`student_id`),
  KEY `status_id` (`status_id`),
  CONSTRAINT `placement_application_table_ibfk_1` FOREIGN KEY (`placement_id`) REFERENCES `placement_table` (`placement_id`) ON DELETE CASCADE,
  CONSTRAINT `placement_application_table_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `student_table` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `placement_application_table_ibfk_3` FOREIGN KEY (`status_id`) REFERENCES `status_table` (`status_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `placement_category_table` (
  `placement_id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  PRIMARY KEY (`placement_id`,`category_id`),
  KEY `placement_id` (`placement_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `placement_category_table_ibfk_1` FOREIGN KEY (`placement_id`) REFERENCES `placement_table` (`placement_id`) ON DELETE CASCADE,
  CONSTRAINT `placement_category_table_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `category_table` (`category_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `placement_department_table` (
  `placement_id` int(11) NOT NULL,
  `department_id` int(11) NOT NULL,
  PRIMARY KEY (`placement_id`,`department_id`),
  KEY `placement_id` (`placement_id`),
  KEY `department_id` (`department_id`),
  CONSTRAINT `placement_department_table_ibfk_1` FOREIGN KEY (`placement_id`) REFERENCES `placement_table` (`placement_id`) ON DELETE CASCADE,
  CONSTRAINT `placement_department_table_ibfk_2` FOREIGN KEY (`department_id`) REFERENCES `department_table` (`department_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `placement_semester_table` (
  `placement_id` int(11) NOT NULL,
  `semester_id` int(11) NOT NULL,
  PRIMARY KEY (`placement_id`,`semester_id`),
  KEY `placement_id` (`placement_id`),
  KEY `semester_id` (`semester_id`),
  CONSTRAINT `placement_semester_table_ibfk_1` FOREIGN KEY (`placement_id`) REFERENCES `placement_table` (`placement_id`) ON DELETE CASCADE,
  CONSTRAINT `placement_semester_table_ibfk_2` FOREIGN KEY (`semester_id`) REFERENCES `semester_table` (`semester_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Training Tables
CREATE TABLE `training_table` (
  `training_id` int(11) NOT NULL AUTO_INCREMENT,
  `creator_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `min_cgpa` decimal(4,2) DEFAULT NULL CHECK (`min_cgpa` >= 0 and `min_cgpa` <= 10.00),
  `end_date` date DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `created_on` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_on` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_date_of_submission` date DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`training_id`),
  KEY `creator_id` (`creator_id`),
  CONSTRAINT `training_table_ibfk_1` FOREIGN KEY (`creator_id`) REFERENCES `user_table` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `training_application_table` (
  `training_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `status_id` int(11) DEFAULT 1,
  `date_of_submission` date DEFAULT curdate(),
  `remarks` text DEFAULT NULL,
  `verified_by` int(11) DEFAULT NULL,
  `verified_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`training_id`,`student_id`),
  KEY `training_id` (`training_id`),
  KEY `student_id` (`student_id`),
  KEY `status_id` (`status_id`),
  CONSTRAINT `training_application_table_ibfk_1` FOREIGN KEY (`training_id`) REFERENCES `training_table` (`training_id`) ON DELETE CASCADE,
  CONSTRAINT `training_application_table_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `student_table` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `training_application_table_ibfk_3` FOREIGN KEY (`status_id`) REFERENCES `status_table` (`status_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `training_department_table` (
  `training_id` int(11) NOT NULL,
  `department_id` int(11) NOT NULL,
  PRIMARY KEY (`training_id`,`department_id`),
  KEY `training_id` (`training_id`),
  KEY `department_id` (`department_id`),
  CONSTRAINT `training_department_table_ibfk_1` FOREIGN KEY (`training_id`) REFERENCES `training_table` (`training_id`) ON DELETE CASCADE,
  CONSTRAINT `training_department_table_ibfk_2` FOREIGN KEY (`department_id`) REFERENCES `department_table` (`department_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `training_semester_table` (
  `training_id` int(11) NOT NULL,
  `semester_id` int(11) NOT NULL,
  PRIMARY KEY (`training_id`,`semester_id`),
  KEY `training_id` (`training_id`),
  KEY `semester_id` (`semester_id`),
  CONSTRAINT `training_semester_table_ibfk_1` FOREIGN KEY (`training_id`) REFERENCES `training_table` (`training_id`) ON DELETE CASCADE,
  CONSTRAINT `training_semester_table_ibfk_2` FOREIGN KEY (`semester_id`) REFERENCES `semester_table` (`semester_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Interview Schedule Table
CREATE TABLE `interview_schedule_table` (
  `interview_id` int(11) NOT NULL AUTO_INCREMENT,
  `placement_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `scheduled_by` int(11) NOT NULL,
  `interview_date` date NOT NULL,
  `interview_time` time NOT NULL,
  `mode` enum('Online','Offline') NOT NULL DEFAULT 'Online',
  `meeting_link` varchar(255) DEFAULT NULL,
  `offline_location` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_on` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_on` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`interview_id`),
  KEY `idx_interview_application` (`placement_id`,`student_id`),
  KEY `fk_interview_scheduler` (`scheduled_by`),
  CONSTRAINT `fk_interview_application` FOREIGN KEY (`placement_id`,`student_id`) REFERENCES `placement_application_table` (`placement_id`, `student_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_interview_scheduler` FOREIGN KEY (`scheduled_by`) REFERENCES `user_table` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Student Related Tables
CREATE TABLE `student_document_table` (
  `document_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `document_type` varchar(100) NOT NULL,
  `document_name` varchar(255) NOT NULL,
  `document_url` varchar(255) NOT NULL,
  `verified` tinyint(1) DEFAULT 0,
  `created_on` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_on` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`document_id`),
  KEY `idx_student_doc_user` (`user_id`),
  KEY `idx_student_doc_type` (`document_type`),
  CONSTRAINT `fk_student_doc_user` FOREIGN KEY (`user_id`) REFERENCES `student_table` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `student_link_table` (
  `link_id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `link_type_id` int(11) NOT NULL,
  `url` varchar(255) NOT NULL,
  `created_on` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`link_id`),
  KEY `fk_student_link_student` (`student_id`),
  KEY `fk_student_link_type` (`link_type_id`),
  CONSTRAINT `fk_student_link_student` FOREIGN KEY (`student_id`) REFERENCES `student_table` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_student_link_type` FOREIGN KEY (`link_type_id`) REFERENCES `link_type_table` (`link_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `student_skill_table` (
  `user_id` int(11) NOT NULL,
  `skill_id` int(11) NOT NULL,
  PRIMARY KEY (`user_id`,`skill_id`),
  KEY `skill_id` (`skill_id`),
  CONSTRAINT `student_skill_table_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `student_table` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `student_skill_table_ibfk_2` FOREIGN KEY (`skill_id`) REFERENCES `skill_table` (`skill_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Communications & Notes Tables
CREATE TABLE `note_table` (
  `note_id` int(11) NOT NULL AUTO_INCREMENT,
  `creator_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `note_url` varchar(255) NOT NULL,
  `created_on` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_on` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`note_id`),
  KEY `creator_id` (`creator_id`),
  CONSTRAINT `note_table_ibfk_1` FOREIGN KEY (`creator_id`) REFERENCES `user_table` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `notice_table` (
  `notice_id` int(11) NOT NULL AUTO_INCREMENT,
  `creator_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `department_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_on` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_on` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`notice_id`),
  KEY `fk_notice_creator` (`creator_id`),
  KEY `fk_notice_department` (`department_id`),
  CONSTRAINT `fk_notice_creator` FOREIGN KEY (`creator_id`) REFERENCES `user_table` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_notice_department` FOREIGN KEY (`department_id`) REFERENCES `department_table` (`department_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;







COMMIT;

INSERT INTO `user_table` (`user_id`, `name`, `role_id`, `email`, `password`, `mobile_no`) VALUES
(1, 'System Admin', 1, 'admin@gmail.com', '$2b$12$MYhCpfm1MI9cxlHh1JSbU.6sAbteFKjXL8wU2V02VSxjlt3lp5tty', '9000000001'),
