-- Insert Payment Application Records
-- Run this after the main migration to populate payment data

-- AP01 - Advance Payment Invoice
INSERT INTO payment_applications (
  payment_no, payment_status, description, gross_amount,
  advance_payment_recovery, retention, vat_recovery, vat, net_payment,
  submitted_date, invoice_date, ffc_live_action, rsg_live_action
) VALUES (
  'AP01', 'Paid', 'Adv Payment Invoice', 43500311.22,
  0, 0, 0, 6525046.68, 43500311.22,
  '2023-11-23', '2023-04-12', 'Transaction Received', 'Transaction Placed'
);

-- AP02 - Advance Payment Invoice 2
INSERT INTO payment_applications (
  payment_no, payment_status, description, gross_amount,
  advance_payment_recovery, retention, vat_recovery, vat, net_payment,
  submitted_date, invoice_date, ffc_live_action, rsg_live_action
) VALUES (
  'AP02', 'Paid', 'Adv Payment Invoice 2', 21750155.61,
  0, 0, 0, 3262523.34, 21750155.61,
  '2024-11-20', '2024-11-22', 'Transaction Received', 'Transaction Placed'
);

-- IPA 1
INSERT INTO payment_applications (
  payment_no, payment_status, description, gross_amount,
  advance_payment_recovery, retention, vat_recovery, vat, net_payment,
  submitted_date, invoice_date, ffc_live_action, rsg_live_action
) VALUES (
  'IPA 1', 'Paid', 'Sept 20th 2023 – Dec 25th 2023', 2571831.80,
  -514366.36, -257183.18, -77154.95, 385774.77, 2108902.08,
  '2023-12-14', '2024-01-22', 'Transaction Received', 'Transaction Placed'
);

-- IPA 2
INSERT INTO payment_applications (
  payment_no, payment_status, description, gross_amount,
  advance_payment_recovery, retention, vat_recovery, vat, net_payment,
  submitted_date, invoice_date, ffc_live_action, rsg_live_action
) VALUES (
  'IPA 2', 'Paid', 'Dec 25th 2023 – Jan 25th 2024', 1727779.48,
  -345555.90, -172777.95, -51833.38, 259166.92, 1416779.17,
  '2024-01-30', '2024-03-26', 'Transaction Received', 'Transaction Placed'
);

-- IPA 3
INSERT INTO payment_applications (
  payment_no, payment_status, description, gross_amount,
  advance_payment_recovery, retention, vat_recovery, vat, net_payment,
  submitted_date, invoice_date, ffc_live_action, rsg_live_action
) VALUES (
  'IPA 3', 'Paid', 'Jan 25th 2024 – Feb 25th 2024', 1363441.89,
  -272688.38, -136344.19, -40903.26, 204516.28, 1118022.35,
  '2024-04-22', '2024-12-04', 'Transaction Received', 'Transaction Placed'
);

-- IPA 4
INSERT INTO payment_applications (
  payment_no, payment_status, description, gross_amount,
  advance_payment_recovery, retention, vat_recovery, vat, net_payment,
  submitted_date, invoice_date, ffc_live_action, rsg_live_action
) VALUES (
  'IPA 4', 'Paid', 'Feb 25th 2024 – Mar 25th 2024', 963176.50,
  -192635.30, -96317.65, -28895.30, 144476.48, 789804.73,
  '2024-05-15', '2024-05-13', 'Transaction Received', 'Transaction Placed'
);

-- IPA 5
INSERT INTO payment_applications (
  payment_no, payment_status, description, gross_amount,
  advance_payment_recovery, retention, vat_recovery, vat, net_payment,
  submitted_date, invoice_date, ffc_live_action, rsg_live_action
) VALUES (
  'IPA 5', 'Paid', 'Mar 25th 2024 – Apr 25th 2024', 6730484.94,
  -1346096.99, -673048.49, -201914.55, 1009572.74, 5518997.65,
  '2024-05-28', '2024-05-28', 'Transaction Received', 'Transaction Placed'
);

-- IPA 6
INSERT INTO payment_applications (
  payment_no, payment_status, description, gross_amount,
  advance_payment_recovery, retention, vat_recovery, vat, net_payment,
  submitted_date, invoice_date, ffc_live_action, rsg_live_action
) VALUES (
  'IPA 6', 'Paid', 'Apr 25th 2024 – May 25th 2024', 3008114.09,
  -601622.82, -300811.41, -90243.42, 451217.11, 2466653.55,
  '2024-04-29', '2024-06-27', 'Transaction Received', 'Transaction Placed'
);

-- IPA 7
INSERT INTO payment_applications (
  payment_no, payment_status, description, gross_amount,
  advance_payment_recovery, retention, vat_recovery, vat, net_payment,
  submitted_date, invoice_date, ffc_live_action, rsg_live_action
) VALUES (
  'IPA 7', 'Paid', 'May 25th 2024 – Jun 25th 2024', 3972034.68,
  -794406.94, -397203.47, -119161.04, 595805.20, 3257068.44,
  '2024-06-26', '2024-07-28', 'Transaction Received', 'Transaction Placed'
);

-- IPA 8
INSERT INTO payment_applications (
  payment_no, payment_status, description, gross_amount,
  advance_payment_recovery, retention, vat_recovery, vat, net_payment,
  submitted_date, invoice_date, ffc_live_action, rsg_live_action
) VALUES (
  'IPA 8', 'Paid', 'Jun 25th 2024 – Jul 25th 2024', 5556560.41,
  -1111312.08, -555656.04, -166696.81, 833484.06, 4556379.54,
  '2024-08-19', '2024-07-05', 'Transaction Received', 'Transaction Placed'
);

-- IPA 9
INSERT INTO payment_applications (
  payment_no, payment_status, description, gross_amount,
  advance_payment_recovery, retention, vat_recovery, vat, net_payment,
  submitted_date, invoice_date, ffc_live_action, rsg_live_action
) VALUES (
  'IPA 9', 'Paid', 'Jul 25th 2024 – Aug 25th 2024', 6512584.83,
  -1302516.97, -651258.48, -195377.54, 976887.72, 5340319.56,
  '2024-08-31', '2024-10-06', 'Transaction Received', 'Transaction Placed'
);

-- IPA 10
INSERT INTO payment_applications (
  payment_no, payment_status, description, gross_amount,
  advance_payment_recovery, retention, vat_recovery, vat, net_payment,
  submitted_date, invoice_date, ffc_live_action, rsg_live_action
) VALUES (
  'IPA 10', 'Paid', 'Aug 25th 2024 – Sep 25th 2024', 5212335.00,
  -1042467.00, -521233.50, -156370.05, 781850.25, 4274114.70,
  '2024-10-02', '2024-10-21', 'Transaction Received', 'Transaction Placed'
);

-- IPA 11
INSERT INTO payment_applications (
  payment_no, payment_status, description, gross_amount,
  advance_payment_recovery, retention, vat_recovery, vat, net_payment,
  submitted_date, invoice_date, ffc_live_action, rsg_live_action
) VALUES (
  'IPA 11', 'Paid', 'Sep 25th 2024 – Oct 25th 2024', 11178597.35,
  -3587211.89, -1117859.74, -538081.78, 1676789.60, 7612233.54,
  '2024-11-23', '2024-12-13', 'Transaction Received', 'Transaction Placed'
);

-- IPA 12
INSERT INTO payment_applications (
  payment_no, payment_status, description, gross_amount,
  advance_payment_recovery, retention, vat_recovery, vat, net_payment,
  submitted_date, invoice_date, ffc_live_action, rsg_live_action
) VALUES (
  'IPA 12', 'Paid', 'Oct 25th 2024 – Nov 25th 2024', 5338593.85,
  -1713154.77, -533859.39, -256973.22, 800789.08, 3635395.56,
  '2024-12-08', '2024-12-29', 'Transaction Received', 'Transaction Placed'
);

-- IPA 13
INSERT INTO payment_applications (
  payment_no, payment_status, description, gross_amount,
  advance_payment_recovery, retention, vat_recovery, vat, net_payment,
  submitted_date, invoice_date, ffc_live_action, rsg_live_action
) VALUES (
  'IPA 13', 'Paid', 'Nov 25th 2024 – Dec 25th 2024', 10523911.06,
  -3377123.06, -1052391.11, -506568.46, 1578586.66, 7166415.10,
  '2025-01-19', '2025-02-02', 'Transaction Received', 'Transaction Placed'
);

-- IPA 14
INSERT INTO payment_applications (
  payment_no, payment_status, description, gross_amount,
  advance_payment_recovery, retention, vat_recovery, vat, net_payment,
  submitted_date, invoice_date, ffc_live_action, rsg_live_action
) VALUES (
  'IPA 14', 'Paid', 'Dec 25th 2024 – Jan 25th 2025', 14789522.58,
  -4745957.80, -1478952.26, -711893.67, 2218428.39, 10071147.24,
  '2025-02-13', '2025-03-02', 'Transaction Received', 'Transaction Placed'
);

-- IPA 15
INSERT INTO payment_applications (
  payment_no, payment_status, description, gross_amount,
  advance_payment_recovery, retention, vat_recovery, vat, net_payment,
  submitted_date, invoice_date, ffc_live_action, rsg_live_action
) VALUES (
  'IPA 15', 'Paid', 'Jan 25th 2025 – Feb 25th 2025', 14091614.85,
  -4521999.21, -1409161.49, -678299.88, 2113742.23, 9595896.51,
  '2025-03-18', '2025-03-27', 'Transaction Received', 'Transaction Placed'
);

-- IPA 16
INSERT INTO payment_applications (
  payment_no, payment_status, description, gross_amount,
  advance_payment_recovery, retention, vat_recovery, vat, net_payment,
  submitted_date, invoice_date, ffc_live_action, rsg_live_action
) VALUES (
  'IPA 16', 'Paid', 'Feb 25th 2025 – Mar 25th 2025', 5147125.92,
  -1651712.71, -514712.59, -247756.91, 772068.89, 3505012.60,
  '2025-04-23', '2025-05-07', 'Transaction Received', 'Transaction Placed'
);

-- IPA 17
INSERT INTO payment_applications (
  payment_no, payment_status, description, gross_amount,
  advance_payment_recovery, retention, vat_recovery, vat, net_payment,
  submitted_date, invoice_date, ffc_live_action, rsg_live_action
) VALUES (
  'IPA 17', 'Paid', 'Mar 25th 2025 – Apr 25th 2025', 14619843.80,
  -4691507.88, -1461984.38, -703726.18, 2192976.57, 9955601.93,
  '2025-05-13', '2025-05-24', 'Transaction Received', 'Transaction Placed'
);

-- IPA 18
INSERT INTO payment_applications (
  payment_no, payment_status, description, gross_amount,
  advance_payment_recovery, retention, vat_recovery, vat, net_payment,
  submitted_date, invoice_date, ffc_live_action, rsg_live_action
) VALUES (
  'IPA 18', 'Paid', 'Apr 25th 2025 – May 25th 2025', 13904093.66,
  -4461823.66, -1390409.37, -669273.55, 2085614.05, 9468201.14,
  '2025-06-18', '2025-06-28', 'Transaction Received', 'Transaction Placed'
);

-- IPA 19
INSERT INTO payment_applications (
  payment_no, payment_status, description, gross_amount,
  advance_payment_recovery, retention, vat_recovery, vat, net_payment,
  submitted_date, invoice_date, ffc_live_action, rsg_live_action
) VALUES (
  'IPA 19', 'Paid', 'May 25th 2025 – Jun 25th 2025', 9497761.36,
  -3047831.62, -949776.14, -457174.74, 1424664.20, 6467643.06,
  '2025-06-16', '2025-07-29', 'Transaction Received', 'Transaction Placed'
);

-- IPA 20
INSERT INTO payment_applications (
  payment_no, payment_status, description, gross_amount,
  advance_payment_recovery, retention, vat_recovery, vat, net_payment,
  submitted_date, invoice_date, ffc_live_action, rsg_live_action
) VALUES (
  'IPA 20', 'Paid', 'Jun 25th 2025 – Jul 25th 2025', 6813139.26,
  -2186336.39, -681313.93, -327950.46, 1021970.89, 4639509.38,
  '2025-09-04', '2025-09-16', 'Transaction Received', 'Transaction Placed'
);

-- IPA 21
INSERT INTO payment_applications (
  payment_no, payment_status, description, gross_amount,
  advance_payment_recovery, retention, vat_recovery, vat, net_payment,
  submitted_date, invoice_date, ffc_live_action, rsg_live_action
) VALUES (
  'IPA 21', 'Paid', 'Jul 25th 2025 – Aug 25th 2025', 5324464.12,
  -1708620.53, 6909904.18, -256293.08, 798669.62, 11068124.30,
  '2025-09-15', '2025-10-16', 'Transaction Received', 'Transaction Placed'
);

-- IPA 22
INSERT INTO payment_applications (
  payment_no, payment_status, description, gross_amount,
  advance_payment_recovery, retention, vat_recovery, vat, net_payment,
  submitted_date, invoice_date, ffc_live_action, rsg_live_action
) VALUES (
  'IPA 22', 'Paid', 'Aug 25th 2025 – Sep 25th 2025', 6418102.35,
  -2059569.04, -320905.12, -308935.36, 962715.35, 4691408.19,
  '2025-10-19', '2025-11-02', 'Transaction Received', 'Transaction Placed'
);

-- IPA 23
INSERT INTO payment_applications (
  payment_no, payment_status, description, gross_amount,
  advance_payment_recovery, retention, vat_recovery, vat, net_payment,
  submitted_date, invoice_date, ffc_live_action, rsg_live_action
) VALUES (
  'IPA 23', 'Paid', 'Sep 25th 2025 – Oct 25th 2025', 18005054.06,
  -5777821.85, -900252.70, -866673.28, 2700758.11, 13161064.34,
  '2025-11-11', '2025-11-27', 'Transaction Received', 'Transaction Placed'
);

-- IPA 24
INSERT INTO payment_applications (
  payment_no, payment_status, description, gross_amount,
  advance_payment_recovery, retention, vat_recovery, vat, net_payment,
  submitted_date, invoice_date, ffc_live_action, rsg_live_action, remarks
) VALUES (
  'IPA 24', 'Submitted on ACONEX', 'Oct 25th 2025 – Nov 25th 2025', 9837424.54,
  -3156829.54, -491871.23, -473524.43, 1475613.68, 7190813.03,
  '2025-12-10', NULL, 'Submitted Via acconex', 'Waiting For payment Certificate', 'To send the Payment Certificate'
);

-- Verify the inserts
SELECT COUNT(*) as total_payments FROM payment_applications;
SELECT 'Payment records inserted successfully!' as message;
