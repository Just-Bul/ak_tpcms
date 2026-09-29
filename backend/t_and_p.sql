-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 29, 2026 at 04:40 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `t_and_p`
--

-- --------------------------------------------------------

--
-- Table structure for table `alumni_table`
--

CREATE TABLE `alumni_table` (
  `alumni_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `passing_year` int(11) NOT NULL,
  `current_company` varchar(255) DEFAULT NULL,
  `designation` varchar(255) DEFAULT NULL,
  `created_on` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_on` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `category_table`
--

CREATE TABLE `category_table` (
  `category_id` int(11) NOT NULL,
  `category` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `category_table`
--

INSERT INTO `category_table` (`category_id`, `category`) VALUES
(2, 'EWS'),
(1, 'GENERAL'),
(3, 'OBC-NCL'),
(4, 'SC'),
(5, 'ST');

-- --------------------------------------------------------

--
-- Table structure for table `department_table`
--

CREATE TABLE `department_table` (
  `department_id` int(11) NOT NULL,
  `department_name` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `coordinator_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `department_table`
--

INSERT INTO `department_table` (`department_id`, `department_name`, `is_active`, `coordinator_id`) VALUES
(11, 'Computer Sci. & Engg.', 1, 44),
(12, 'ETE', 1, 45),
(13, 'Civil Engg.', 1, 46),
(14, 'Mech', 1, 47);

-- --------------------------------------------------------

--
-- Table structure for table `division_table`
--

CREATE TABLE `division_table` (
  `division_id` int(11) NOT NULL,
  `division` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `division_table`
--

INSERT INTO `division_table` (`division_id`, `division`) VALUES
(1, 'First'),
(2, 'Second'),
(3, 'Third');

-- --------------------------------------------------------

--
-- Table structure for table `document_table`
--

CREATE TABLE `document_table` (
  `document_id` int(11) NOT NULL,
  `owner_id` int(11) NOT NULL,
  `owner_type` varchar(20) NOT NULL,
  `document_type` varchar(100) NOT NULL,
  `document_name` varchar(255) NOT NULL,
  `file_url` varchar(500) NOT NULL,
  `original_file_name` varchar(255) DEFAULT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `file_size` int(11) DEFAULT NULL,
  `verification_status` varchar(30) NOT NULL DEFAULT 'PENDING',
  `verification_remarks` text DEFAULT NULL,
  `verified_by` int(11) DEFAULT NULL,
  `verified_on` timestamp NULL DEFAULT NULL,
  `uploaded_by` int(11) NOT NULL,
  `created_on` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_on` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `gender_table`
--

CREATE TABLE `gender_table` (
  `gender_id` int(11) NOT NULL,
  `gender` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `gender_table`
--

INSERT INTO `gender_table` (`gender_id`, `gender`) VALUES
(1, 'Female'),
(2, 'Male'),
(3, 'Others');

-- --------------------------------------------------------

--
-- Table structure for table `note_table`
--

CREATE TABLE `note_table` (
  `note_id` int(11) NOT NULL,
  `creator_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `note_url` varchar(255) NOT NULL,
  `created_on` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_on` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `note_table`
--

INSERT INTO `note_table` (`note_id`, `creator_id`, `title`, `description`, `note_url`, `created_on`, `updated_on`) VALUES
(3, 1, 'DBMS', 'QWERTY', 'http://localhost:5000/public/notes_media/1784534581739-bonafide.pdf', '2026-07-20 02:33:28', '2026-07-20 02:33:28');

-- --------------------------------------------------------

--
-- Table structure for table `organization_table`
--

CREATE TABLE `organization_table` (
  `user_id` int(11) NOT NULL,
  `approval_id` int(11) DEFAULT 1,
  `document_url` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `remarks` text DEFAULT NULL,
  `sector_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `organization_table`
--

INSERT INTO `organization_table` (`user_id`, `approval_id`, `document_url`, `is_active`, `remarks`, `sector_id`) VALUES
(50, 2, NULL, 1, NULL, NULL),
(51, 2, NULL, 1, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `placement_application_table`
--

CREATE TABLE `placement_application_table` (
  `placement_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `status_id` int(11) DEFAULT 1,
  `date_of_submission` date DEFAULT curdate(),
  `remarks` text DEFAULT NULL,
  `verified_by` int(11) DEFAULT NULL,
  `verified_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `placement_application_table`
--

INSERT INTO `placement_application_table` (`placement_id`, `student_id`, `status_id`, `date_of_submission`, `remarks`, `verified_by`, `verified_at`) VALUES
(5, 48, 2, '2026-07-20', NULL, NULL, NULL),
(6, 48, 3, '2026-07-20', NULL, NULL, NULL),
(7, 48, 2, '2026-07-20', NULL, NULL, NULL),
(8, 48, 2, '2026-07-20', NULL, NULL, NULL),
(9, 53, 1, '2026-09-29', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `placement_category_table`
--

CREATE TABLE `placement_category_table` (
  `placement_id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `placement_department_table`
--

CREATE TABLE `placement_department_table` (
  `placement_id` int(11) NOT NULL,
  `department_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `placement_semester_table`
--

CREATE TABLE `placement_semester_table` (
  `placement_id` int(11) NOT NULL,
  `semester_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `placement_table`
--

CREATE TABLE `placement_table` (
  `placement_id` int(11) NOT NULL,
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
  `end_date` date NOT NULL DEFAULT (curdate() + interval 15 day),
  `start_date` date NOT NULL DEFAULT curdate()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `placement_table`
--

INSERT INTO `placement_table` (`placement_id`, `creator_id`, `title`, `description`, `min_cgpa`, `min_tenth_division_id`, `min_twelfth_division_id`, `image_url`, `has_backlog`, `salary_lower`, `salary_upper`, `created_on`, `updated_on`, `last_date_of_submission`, `is_active`, `end_date`, `start_date`) VALUES
(5, 1, 'JFE', 'QWERTY', 5.00, NULL, NULL, 'http://localhost:5000/public/banner_media/1784534534782-Screenshot 2026-07-04 191342.png', 1, 12000, 25000, '2026-07-20 02:32:27', '2026-07-20 02:32:27', '2026-07-30', 1, '2026-07-30', '2026-07-22'),
(6, 50, 'MERN DEV', NULL, 5.00, NULL, NULL, 'http://localhost:5000/public/banner_media/1784542459945-WhatsApp Image 2025-11-29 at 8.43.09 PM.jpeg', 1, 25000, 50000, '2026-07-20 04:44:21', '2026-07-20 04:44:21', '2026-07-22', 1, '2026-07-31', '2026-07-23'),
(7, 44, 'TRY', 'qwerty', 5.00, NULL, NULL, 'http://localhost:5000/public/banner_media/1784542743902-WhatsApp Image 2025-09-18 at 8.48.00 AM.jpeg', 1, 25000, 50000, '2026-07-20 04:49:09', '2026-07-20 04:49:09', '2026-07-24', 1, '2026-07-31', '2026-07-25'),
(8, 51, 'DEO', 'DEO', NULL, NULL, NULL, 'http://localhost:5000/public/banner_media/1784544098766-WhatsApp Image 2025-11-29 at 8.43.09 PM.jpeg', 1, 12000, 25000, '2026-07-20 05:11:44', '2026-07-20 05:11:44', '2026-07-22', 1, '2026-07-31', '2026-07-23'),
(9, 1, 'tesr', NULL, 3.60, 1, 1, NULL, 0, 121100, 110050, '2026-09-26 15:58:28', '2026-09-26 15:58:28', '2026-09-30', 1, '2026-09-30', '2026-09-23');

-- --------------------------------------------------------

--
-- Table structure for table `role_table`
--

CREATE TABLE `role_table` (
  `role_id` int(11) NOT NULL,
  `role` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `role_table`
--

INSERT INTO `role_table` (`role_id`, `role`) VALUES
(3, 'Coordinator'),
(4, 'Organization'),
(2, 'Student'),
(1, 'Super Admin');

-- --------------------------------------------------------

--
-- Table structure for table `sector_table`
--

CREATE TABLE `sector_table` (
  `sector_id` int(11) NOT NULL,
  `sector_name` varchar(100) NOT NULL,
  `sector_shorthand` varchar(5) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sector_table`
--

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

-- --------------------------------------------------------

--
-- Table structure for table `semester_table`
--

CREATE TABLE `semester_table` (
  `semester_id` int(11) NOT NULL,
  `semester` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `semester_table`
--

INSERT INTO `semester_table` (`semester_id`, `semester`) VALUES
(8, 'Eighth'),
(5, 'Fifth'),
(1, 'First'),
(4, 'Fourth'),
(2, 'Second'),
(7, 'Seventh'),
(6, 'Sixth'),
(3, 'Third');

-- --------------------------------------------------------

--
-- Table structure for table `skill_table`
--

CREATE TABLE `skill_table` (
  `skill_id` int(11) NOT NULL,
  `skill` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `skill_table`
--

INSERT INTO `skill_table` (`skill_id`, `skill`) VALUES
(56, 'C'),
(57, 'C++'),
(51, 'HTML'),
(55, 'MongoDB'),
(54, 'MySQL'),
(53, 'Php'),
(52, 'React');

-- --------------------------------------------------------

--
-- Table structure for table `status_table`
--

CREATE TABLE `status_table` (
  `status_id` int(11) NOT NULL,
  `status` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `status_table`
--

INSERT INTO `status_table` (`status_id`, `status`) VALUES
(2, 'Approved'),
(1, 'Pending'),
(3, 'Rejected');

-- --------------------------------------------------------

--
-- Table structure for table `student_document_table`
--

CREATE TABLE `student_document_table` (
  `document_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `document_type` varchar(100) NOT NULL,
  `document_name` varchar(255) NOT NULL,
  `document_url` varchar(255) NOT NULL,
  `verified` tinyint(1) DEFAULT 0,
  `created_on` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_on` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_skill_table`
--

CREATE TABLE `student_skill_table` (
  `user_id` int(11) NOT NULL,
  `skill_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_table`
--

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
  `graduation` tinyint(1) NOT NULL DEFAULT 0,
  `graduation_year` int(11) DEFAULT NULL,
  `grade_card_url` varchar(255) DEFAULT NULL,
  `student_status` varchar(20) NOT NULL DEFAULT 'ACTIVE',
  `category_id` int(11) DEFAULT 1,
  `resume_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student_table`
--

INSERT INTO `student_table` (`user_id`, `roll_no`, `date_of_birth`, `semester_id`, `department_id`, `gender_id`, `cgpa`, `tenth_division_id`, `twelfth_division_id`, `image_url`, `has_backlog`, `is_graduate`, `graduation`, `graduation_year`, `grade_card_url`, `student_status`, `category_id`, `resume_url`) VALUES
(48, '242050007013', '1985-09-24', 7, 11, 2, 3.50, 1, 1, 'http://localhost:5000/public/profile_media/1789319932187-image.jpg', 0, 1, 0, NULL, NULL, 'ACTIVE', 1, 'http://localhost:5000/public/resume_media/1790466464437-Syed_Akhter_Hussain_resume.pdf'),
(52, '232010007001', NULL, 1, 11, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, NULL, 'ACTIVE', 1, NULL),
(53, '232010007039', '2026-09-09', 4, 14, 2, 2.00, 3, 3, 'http://localhost:5000/public/profile_media/1790472586461-image.jpg', 0, 0, 0, NULL, NULL, 'ACTIVE', 1, 'http://localhost:5000/public/resume_media/1790641789575-Partha_Pratim_Kalita_resume.pdf');

-- --------------------------------------------------------

--
-- Table structure for table `training_application_table`
--

CREATE TABLE `training_application_table` (
  `training_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `status_id` int(11) DEFAULT 1,
  `date_of_submission` date DEFAULT curdate(),
  `remarks` text DEFAULT NULL,
  `verified_by` int(11) DEFAULT NULL,
  `verified_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `training_application_table`
--

INSERT INTO `training_application_table` (`training_id`, `student_id`, `status_id`, `date_of_submission`, `remarks`, `verified_by`, `verified_at`) VALUES
(6, 48, 1, '2026-07-20', NULL, NULL, NULL),
(7, 48, 2, '2026-07-20', '', NULL, NULL),
(8, 48, 2, '2026-07-20', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `training_department_table`
--

CREATE TABLE `training_department_table` (
  `training_id` int(11) NOT NULL,
  `department_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `training_semester_table`
--

CREATE TABLE `training_semester_table` (
  `training_id` int(11) NOT NULL,
  `semester_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `training_table`
--

CREATE TABLE `training_table` (
  `training_id` int(11) NOT NULL,
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
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `training_table`
--

INSERT INTO `training_table` (`training_id`, `creator_id`, `title`, `description`, `min_cgpa`, `end_date`, `start_date`, `image_url`, `created_on`, `updated_on`, `last_date_of_submission`, `is_active`) VALUES
(6, 1, 'Web development Intern', 'QWERTY', 5.00, '2026-08-27', '2026-07-27', 'http://localhost:5000/public/banner_media/1784534419779-banner.png', '2026-07-20 02:31:16', '2026-07-20 02:31:16', '2026-07-22', 1),
(7, 50, 'JAVA Developer', 'QWERTY', 5.00, '2026-08-31', '2026-08-01', 'http://localhost:5000/public/banner_media/1784542350703-a.jpeg', '2026-07-20 04:42:37', '2026-07-20 04:42:37', '2026-07-23', 1),
(8, 44, 'DecOps', 'qwerty', 5.00, '2026-07-31', '2026-07-25', 'http://localhost:5000/public/banner_media/1784542655915-WhatsApp Image 2025-11-29 at 8.43.09 PM.jpg', '2026-07-20 04:47:41', '2026-07-20 04:47:41', '2026-07-24', 1);

-- --------------------------------------------------------

--
-- Table structure for table `user_table`
--

CREATE TABLE `user_table` (
  `user_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `role_id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `auth_token` varchar(255) DEFAULT NULL,
  `mobile_no` varchar(255) DEFAULT NULL,
  `created_on` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_on` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_login` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_table`
--

INSERT INTO `user_table` (`user_id`, `name`, `role_id`, `email`, `password`, `auth_token`, `mobile_no`, `created_on`, `updated_on`, `last_login`) VALUES
(1, '', 1, 'user1@gmail.com', '$2b$12$MYhCpfm1MI9cxlHh1JSbU.6sAbteFKjXL8wU2V02VSxjlt3lp5tty', NULL, '8889995550', '2026-07-05 02:06:46', '2026-09-29 10:45:20', '2026-09-29 05:15:20'),
(44, 'K. Pratim Kalita', 3, 'bvec.cse@gmail.com', '$2b$10$KLvCbr14r7jkQZ8UyJQKheVBfV2rm2loxPLTAIRpHX4qZ1HFuzgUK', NULL, NULL, '2026-07-20 01:56:07', '2026-07-20 10:59:18', '2026-07-20 05:29:18'),
(45, 'A B. Nath', 3, 'bvec.ete@gmail.com', '$2b$10$bYhMgMT98cBeY1uLZlKet.q4R4ZnfSjaxFfM7ehS2/qOAMW8tj92i', NULL, NULL, '2026-07-20 01:57:26', '2026-07-20 01:57:26', NULL),
(46, 'X Y. Sharma', 3, 'bvec.civil@gmail.com', '$2b$10$6zu.iB4p1pagM9CZjgyxdeuOVgM0mA.ePAeJnQfkMdaf.iloFuye.', NULL, NULL, '2026-07-20 01:58:19', '2026-07-20 01:58:19', NULL),
(47, 'M. N. Saikia', 3, 'bvec.mech@gmail.com', '$2b$10$KDBS8guFGWXxmSA/h.zNnevBELnknOeumgeF9gRnvQAwq9Wuu7ULm', NULL, NULL, '2026-07-20 01:59:00', '2026-09-27 01:04:37', '2026-09-26 19:34:37'),
(48, 'Syed Akhter Hussain', 2, 'ah076145@gmail.com', '$2b$10$AgMmzLD2Zpz9bP7tY04UUub/K2m./PgXn60yoqFQ0N0RSNng2ni4W', NULL, '9127222171', '2026-07-20 01:59:46', '2026-09-26 23:46:55', '2026-09-26 18:16:55'),
(50, '8BitBannar', 4, '8bitbannar@gmail.com', '$2b$10$rGPoGfdhtkEwjcGiK7bmpObc/4QQY14gX5NDNmUvDHp4zSTE7I8Ta', NULL, '9127222161', '2026-07-20 04:35:32', '2026-09-26 23:49:00', '2026-09-26 18:19:00'),
(51, 'Google', 4, 'google@gmail.com', '$2b$12$suwpuojE.j9x0h5HItgsU.DlnCWAPou2fR9yFottND1o.pkZgLC..', NULL, '7894561230', '2026-07-20 05:08:06', '2026-07-20 10:39:38', '2026-07-20 05:09:38'),
(52, 'Abhis M', 2, 'user11@gmail.com', '$2b$12$givDj0iAEXLdc14w4nAMLeW3iZZWNihRuulGTU88C76xxOER4bzNa', NULL, NULL, '2026-09-26 14:59:01', '2026-09-26 14:59:01', NULL),
(53, 'Partha Pratim Kalita', 2, 'user12@gmail.com', '$2b$12$FJslskj0tmGouWm4dbWE.emh0g3XyBVlVnSV2oYsebZ2TPhRn8Gju', NULL, '0123456789', '2026-09-26 15:20:12', '2026-09-29 00:21:45', '2026-09-28 18:51:45');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `alumni_table`
--
ALTER TABLE `alumni_table`
  ADD PRIMARY KEY (`alumni_id`),
  ADD UNIQUE KEY `uq_alumni_user` (`user_id`),
  ADD KEY `idx_alumni_passing_year` (`passing_year`);

--
-- Indexes for table `category_table`
--
ALTER TABLE `category_table`
  ADD PRIMARY KEY (`category_id`),
  ADD UNIQUE KEY `uq_category` (`category`);

--
-- Indexes for table `department_table`
--
ALTER TABLE `department_table`
  ADD PRIMARY KEY (`department_id`),
  ADD UNIQUE KEY `department_name` (`department_name`),
  ADD KEY `fk_department_coordinator` (`coordinator_id`);

--
-- Indexes for table `division_table`
--
ALTER TABLE `division_table`
  ADD PRIMARY KEY (`division_id`),
  ADD UNIQUE KEY `uq_division` (`division`);

--
-- Indexes for table `document_table`
--
ALTER TABLE `document_table`
  ADD PRIMARY KEY (`document_id`),
  ADD KEY `document_owner` (`owner_id`,`owner_type`),
  ADD KEY `document_type` (`document_type`),
  ADD KEY `verification_status` (`verification_status`),
  ADD KEY `verified_by` (`verified_by`),
  ADD KEY `uploaded_by` (`uploaded_by`);

--
-- Indexes for table `gender_table`
--
ALTER TABLE `gender_table`
  ADD PRIMARY KEY (`gender_id`),
  ADD UNIQUE KEY `uq_gender` (`gender`);

--
-- Indexes for table `note_table`
--
ALTER TABLE `note_table`
  ADD PRIMARY KEY (`note_id`),
  ADD KEY `creator_id` (`creator_id`);

--
-- Indexes for table `organization_table`
--
ALTER TABLE `organization_table`
  ADD PRIMARY KEY (`user_id`),
  ADD KEY `approval_id` (`approval_id`),
  ADD KEY `fk_organization_sector` (`sector_id`);

--
-- Indexes for table `placement_application_table`
--
ALTER TABLE `placement_application_table`
  ADD PRIMARY KEY (`placement_id`,`student_id`),
  ADD KEY `placement_id` (`placement_id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `status_id` (`status_id`);

--
-- Indexes for table `placement_category_table`
--
ALTER TABLE `placement_category_table`
  ADD PRIMARY KEY (`placement_id`,`category_id`),
  ADD KEY `placement_id` (`placement_id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `placement_department_table`
--
ALTER TABLE `placement_department_table`
  ADD PRIMARY KEY (`placement_id`,`department_id`),
  ADD KEY `placement_id` (`placement_id`),
  ADD KEY `department_id` (`department_id`);

--
-- Indexes for table `placement_semester_table`
--
ALTER TABLE `placement_semester_table`
  ADD PRIMARY KEY (`placement_id`,`semester_id`),
  ADD KEY `placement_id` (`placement_id`),
  ADD KEY `semester_id` (`semester_id`);

--
-- Indexes for table `placement_table`
--
ALTER TABLE `placement_table`
  ADD PRIMARY KEY (`placement_id`),
  ADD KEY `creator_id` (`creator_id`),
  ADD KEY `min_tenth_division_id` (`min_tenth_division_id`),
  ADD KEY `min_twelfth_division_id` (`min_twelfth_division_id`);

--
-- Indexes for table `role_table`
--
ALTER TABLE `role_table`
  ADD PRIMARY KEY (`role_id`),
  ADD UNIQUE KEY `uq_role` (`role`);

--
-- Indexes for table `sector_table`
--
ALTER TABLE `sector_table`
  ADD PRIMARY KEY (`sector_id`),
  ADD UNIQUE KEY `sector_shorthand` (`sector_shorthand`);

--
-- Indexes for table `semester_table`
--
ALTER TABLE `semester_table`
  ADD PRIMARY KEY (`semester_id`),
  ADD UNIQUE KEY `uq_semester` (`semester`);

--
-- Indexes for table `skill_table`
--
ALTER TABLE `skill_table`
  ADD PRIMARY KEY (`skill_id`),
  ADD UNIQUE KEY `skill` (`skill`);

--
-- Indexes for table `status_table`
--
ALTER TABLE `status_table`
  ADD PRIMARY KEY (`status_id`),
  ADD UNIQUE KEY `uq_status` (`status`);

--
-- Indexes for table `student_document_table`
--
ALTER TABLE `student_document_table`
  ADD PRIMARY KEY (`document_id`),
  ADD KEY `idx_student_doc_user` (`user_id`),
  ADD KEY `idx_student_doc_type` (`document_type`);

--
-- Indexes for table `student_skill_table`
--
ALTER TABLE `student_skill_table`
  ADD PRIMARY KEY (`user_id`,`skill_id`),
  ADD KEY `skill_id` (`skill_id`);

--
-- Indexes for table `student_table`
--
ALTER TABLE `student_table`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `roll_no` (`roll_no`),
  ADD KEY `semester_id` (`semester_id`),
  ADD KEY `department_id` (`department_id`),
  ADD KEY `gender_id` (`gender_id`),
  ADD KEY `tenth_division_id` (`tenth_division_id`),
  ADD KEY `twelfth_division_id` (`twelfth_division_id`),
  ADD KEY `fk_category` (`category_id`),
  ADD KEY `graduation_year` (`graduation_year`),
  ADD KEY `idx_student_status` (`student_status`);

--
-- Indexes for table `training_application_table`
--
ALTER TABLE `training_application_table`
  ADD PRIMARY KEY (`training_id`,`student_id`),
  ADD KEY `training_id` (`training_id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `status_id` (`status_id`);

--
-- Indexes for table `training_department_table`
--
ALTER TABLE `training_department_table`
  ADD PRIMARY KEY (`training_id`,`department_id`),
  ADD KEY `training_id` (`training_id`),
  ADD KEY `department_id` (`department_id`);

--
-- Indexes for table `training_semester_table`
--
ALTER TABLE `training_semester_table`
  ADD PRIMARY KEY (`training_id`,`semester_id`),
  ADD KEY `training_id` (`training_id`),
  ADD KEY `semester_id` (`semester_id`);

--
-- Indexes for table `training_table`
--
ALTER TABLE `training_table`
  ADD PRIMARY KEY (`training_id`),
  ADD KEY `creator_id` (`creator_id`);

--
-- Indexes for table `user_table`
--
ALTER TABLE `user_table`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `uq_mobile` (`mobile_no`),
  ADD KEY `role_id` (`role_id`),
  ADD KEY `mobile_no` (`mobile_no`) USING BTREE;

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `alumni_table`
--
ALTER TABLE `alumni_table`
  MODIFY `alumni_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `category_table`
--
ALTER TABLE `category_table`
  MODIFY `category_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `department_table`
--
ALTER TABLE `department_table`
  MODIFY `department_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `division_table`
--
ALTER TABLE `division_table`
  MODIFY `division_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `document_table`
--
ALTER TABLE `document_table`
  MODIFY `document_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `gender_table`
--
ALTER TABLE `gender_table`
  MODIFY `gender_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `note_table`
--
ALTER TABLE `note_table`
  MODIFY `note_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `placement_table`
--
ALTER TABLE `placement_table`
  MODIFY `placement_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `role_table`
--
ALTER TABLE `role_table`
  MODIFY `role_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `sector_table`
--
ALTER TABLE `sector_table`
  MODIFY `sector_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `semester_table`
--
ALTER TABLE `semester_table`
  MODIFY `semester_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `skill_table`
--
ALTER TABLE `skill_table`
  MODIFY `skill_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60;

--
-- AUTO_INCREMENT for table `status_table`
--
ALTER TABLE `status_table`
  MODIFY `status_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `student_document_table`
--
ALTER TABLE `student_document_table`
  MODIFY `document_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `training_table`
--
ALTER TABLE `training_table`
  MODIFY `training_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `user_table`
--
ALTER TABLE `user_table`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=55;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `alumni_table`
--
ALTER TABLE `alumni_table`
  ADD CONSTRAINT `fk_alumni_student` FOREIGN KEY (`user_id`) REFERENCES `student_table` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `department_table`
--
ALTER TABLE `department_table`
  ADD CONSTRAINT `fk_department_coordinator` FOREIGN KEY (`coordinator_id`) REFERENCES `user_table` (`user_id`) ON UPDATE CASCADE;

--
-- Constraints for table `document_table`
--
ALTER TABLE `document_table`
  ADD CONSTRAINT `fk_document_uploaded_by` FOREIGN KEY (`uploaded_by`) REFERENCES `user_table` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_document_verified_by` FOREIGN KEY (`verified_by`) REFERENCES `user_table` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `note_table`
--
ALTER TABLE `note_table`
  ADD CONSTRAINT `note_table_ibfk_1` FOREIGN KEY (`creator_id`) REFERENCES `user_table` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `organization_table`
--
ALTER TABLE `organization_table`
  ADD CONSTRAINT `fk_organization_sector` FOREIGN KEY (`sector_id`) REFERENCES `sector_table` (`sector_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `organization_table_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user_table` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `organization_table_ibfk_2` FOREIGN KEY (`approval_id`) REFERENCES `status_table` (`status_id`);

--
-- Constraints for table `placement_application_table`
--
ALTER TABLE `placement_application_table`
  ADD CONSTRAINT `placement_application_table_ibfk_1` FOREIGN KEY (`placement_id`) REFERENCES `placement_table` (`placement_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `placement_application_table_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `student_table` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `placement_application_table_ibfk_3` FOREIGN KEY (`status_id`) REFERENCES `status_table` (`status_id`) ON DELETE CASCADE;

--
-- Constraints for table `placement_category_table`
--
ALTER TABLE `placement_category_table`
  ADD CONSTRAINT `placement_category_table_ibfk_1` FOREIGN KEY (`placement_id`) REFERENCES `placement_table` (`placement_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `placement_category_table_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `category_table` (`category_id`) ON DELETE CASCADE;

--
-- Constraints for table `placement_department_table`
--
ALTER TABLE `placement_department_table`
  ADD CONSTRAINT `placement_department_table_ibfk_1` FOREIGN KEY (`placement_id`) REFERENCES `placement_table` (`placement_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `placement_department_table_ibfk_2` FOREIGN KEY (`department_id`) REFERENCES `department_table` (`department_id`) ON DELETE CASCADE;

--
-- Constraints for table `placement_semester_table`
--
ALTER TABLE `placement_semester_table`
  ADD CONSTRAINT `placement_semester_table_ibfk_1` FOREIGN KEY (`placement_id`) REFERENCES `placement_table` (`placement_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `placement_semester_table_ibfk_2` FOREIGN KEY (`semester_id`) REFERENCES `semester_table` (`semester_id`) ON DELETE CASCADE;

--
-- Constraints for table `placement_table`
--
ALTER TABLE `placement_table`
  ADD CONSTRAINT `placement_table_ibfk_1` FOREIGN KEY (`creator_id`) REFERENCES `user_table` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `placement_table_ibfk_2` FOREIGN KEY (`min_tenth_division_id`) REFERENCES `division_table` (`division_id`),
  ADD CONSTRAINT `placement_table_ibfk_3` FOREIGN KEY (`min_twelfth_division_id`) REFERENCES `division_table` (`division_id`);

--
-- Constraints for table `student_document_table`
--
ALTER TABLE `student_document_table`
  ADD CONSTRAINT `fk_student_doc_user` FOREIGN KEY (`user_id`) REFERENCES `student_table` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `student_skill_table`
--
ALTER TABLE `student_skill_table`
  ADD CONSTRAINT `student_skill_table_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `student_table` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_skill_table_ibfk_2` FOREIGN KEY (`skill_id`) REFERENCES `skill_table` (`skill_id`) ON DELETE CASCADE;

--
-- Constraints for table `student_table`
--
ALTER TABLE `student_table`
  ADD CONSTRAINT `fk_category` FOREIGN KEY (`category_id`) REFERENCES `category_table` (`category_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `student_table_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user_table` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_table_ibfk_2` FOREIGN KEY (`semester_id`) REFERENCES `semester_table` (`semester_id`),
  ADD CONSTRAINT `student_table_ibfk_3` FOREIGN KEY (`department_id`) REFERENCES `department_table` (`department_id`),
  ADD CONSTRAINT `student_table_ibfk_4` FOREIGN KEY (`gender_id`) REFERENCES `gender_table` (`gender_id`),
  ADD CONSTRAINT `student_table_ibfk_5` FOREIGN KEY (`tenth_division_id`) REFERENCES `division_table` (`division_id`),
  ADD CONSTRAINT `student_table_ibfk_6` FOREIGN KEY (`twelfth_division_id`) REFERENCES `division_table` (`division_id`);

--
-- Constraints for table `training_application_table`
--
ALTER TABLE `training_application_table`
  ADD CONSTRAINT `training_application_table_ibfk_1` FOREIGN KEY (`training_id`) REFERENCES `training_table` (`training_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `training_application_table_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `student_table` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `training_application_table_ibfk_3` FOREIGN KEY (`status_id`) REFERENCES `status_table` (`status_id`) ON DELETE CASCADE;

--
-- Constraints for table `training_department_table`
--
ALTER TABLE `training_department_table`
  ADD CONSTRAINT `training_department_table_ibfk_1` FOREIGN KEY (`training_id`) REFERENCES `training_table` (`training_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `training_department_table_ibfk_2` FOREIGN KEY (`department_id`) REFERENCES `department_table` (`department_id`) ON DELETE CASCADE;

--
-- Constraints for table `training_semester_table`
--
ALTER TABLE `training_semester_table`
  ADD CONSTRAINT `training_semester_table_ibfk_1` FOREIGN KEY (`training_id`) REFERENCES `training_table` (`training_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `training_semester_table_ibfk_2` FOREIGN KEY (`semester_id`) REFERENCES `semester_table` (`semester_id`) ON DELETE CASCADE;

--
-- Constraints for table `training_table`
--
ALTER TABLE `training_table`
  ADD CONSTRAINT `training_table_ibfk_1` FOREIGN KEY (`creator_id`) REFERENCES `user_table` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `user_table`
--
ALTER TABLE `user_table`
  ADD CONSTRAINT `user_table_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `role_table` (`role_id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
