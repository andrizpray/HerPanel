-- Roundcube Database Backup
-- Database: roundcube
-- Backup Date: $(date +%Y-%m-%d %H:%M:%S)
-- Database User: roundcube

-- Users table
CREATE TABLE IF NOT EXISTS `users` (
  `user_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(128) NOT NULL,
  `mail_host` varchar(128) NOT NULL,
  `alias` varchar(128) DEFAULT NULL,
  `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_login` datetime DEFAULT NULL,
  `language` varchar(5) DEFAULT NULL,
  `preferences` text,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`,`mail_host`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sessions table
CREATE TABLE IF NOT EXISTS `session` (
  `sess_id` varchar(128) NOT NULL,
  `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `changed` datetime DEFAULT NULL,
  `ip` varchar(45) DEFAULT NULL,
  `vars` mediumtext,
  PRIMARY KEY (`sess_id`),
  KEY `created` (`created`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Messages table
CREATE TABLE IF NOT EXISTS `messages` (
  `message_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) unsigned NOT NULL,
  `del` tinyint(1) NOT NULL DEFAULT '0',
  `cache_key` varchar(128) NOT NULL,
  `uid` int(11) NOT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `from` varchar(255) DEFAULT NULL,
  `to` varchar(255) DEFAULT NULL,
  `cc` varchar(255) DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  `size` int(11) DEFAULT NULL,
  `headers` text,
  `structure` text,
  PRIMARY KEY (`message_id`),
  KEY `user_cache` (`user_id`,`cache_key`),
  KEY `del_uid` (`del`,`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Contacts table
CREATE TABLE IF NOT EXISTS `contacts` (
  `contact_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) unsigned NOT NULL,
  `changed` datetime DEFAULT NULL,
  `name` varchar(128) NOT NULL,
  `email` varchar(255) NOT NULL,
  `firstname` varchar(128) DEFAULT NULL,
  `surname` varchar(128) DEFAULT NULL,
  `vcard` text,
  `words` text,
  PRIMARY KEY (`contact_id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Contact groups table
CREATE TABLE IF NOT EXISTS `contactgroups` (
  `group_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) unsigned NOT NULL,
  `changed` datetime DEFAULT NULL,
  `name` varchar(128) NOT NULL,
  PRIMARY KEY (`group_id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Contact group members table
CREATE TABLE IF NOT EXISTS `contactgroupmembers` (
  `contactgroup_id` int(11) unsigned NOT NULL,
  `contact_id` int(11) unsigned NOT NULL,
  PRIMARY KEY (`contactgroup_id`,`contact_id`),
  KEY `contact_id` (`contact_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Identities table
CREATE TABLE IF NOT EXISTS `identities` (
  `identity_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) unsigned NOT NULL,
  `changed` datetime DEFAULT NULL,
  `name` varchar(128) NOT NULL,
  `email` varchar(255) NOT NULL,
  `organization` varchar(128) DEFAULT NULL,
  `email_other` varchar(255) DEFAULT NULL,
  `reply-to` varchar(255) DEFAULT NULL,
  `bcc` varchar(255) DEFAULT NULL,
  `signature` text,
  `html_signature` text,
  PRIMARY KEY (`identity_id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Saved searches table
CREATE TABLE IF NOT EXISTS `searches` (
  `search_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) unsigned NOT NULL,
  `name` varchar(128) NOT NULL,
  `conditions` text NOT NULL,
  PRIMARY KEY (`search_id`),
  UNIQUE KEY `user_name` (`user_id`,`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Quota table
CREATE TABLE IF NOT EXISTS `quota` (
  `username` varchar(128) NOT NULL,
  `bytes` int(11) NOT NULL DEFAULT '0',
  `messages` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;