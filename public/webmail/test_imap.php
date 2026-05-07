<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$imap_host = '{127.0.0.1:143/imap/notls}INBOX';
$user = 'test@drizdev.space';
$pass = 'TestEmail123!';

echo "Trying to connect to IMAP...\n";
$mbox = imap_open($imap_host, $user, $pass);
if ($mbox) {
    echo "SUCCESS! IMAP connection established.\n";
    echo "Mailbox: " . imap_lastsError($mbox) . "\n";
    imap_close($mbox);
} else {
    echo "FAILED: " . imap_lastError() . "\n";
}
