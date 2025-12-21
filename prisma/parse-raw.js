
const fs = require('fs');
const path = require('path');

function parseCurrency(str) {
    if (!str || str.trim() === '-' || str.trim() === '') return null;
    let cleanStr = str.replace(/,/g, '').trim();
    if (cleanStr.startsWith('(') && cleanStr.endsWith(')')) {
        cleanStr = '-' + cleanStr.slice(1, -1);
    }
    return parseFloat(cleanStr);
}

function parseDate(str) {
    if (!str || str.trim().length === 0 || str.trim() === '-' || str.includes('Not in source') || str.includes('Wait')) return new Date();
    const cleanStr = str.replace(/"/g, '').trim();

    // Try D/M/Y or D/M/YY
    const parts = cleanStr.split('/');
    if (parts.length === 3) {
        let year = parseInt(parts[2]);
        if (year < 100) year += 2000;
        return new Date(`${year}-${parts[0]}-${parts[1]}`);
    }
    // Try D-M-Y
    const partsDash = cleanStr.split('-');
    if (partsDash.length === 3) {
        let year = parseInt(partsDash[2]);
        if (year < 100) year += 2000;
        return new Date(`${year}-${partsDash[1]}-${partsDash[0]}`);
    }
    const tried = new Date(cleanStr);
    if (!isNaN(tried.getTime())) return tried;
    return new Date();
}

function mapStatus(statusText) {
    const s = (statusText || '').toLowerCase();

    if (s.includes('closed out')) return 'DVORRIssued';
    if (s.includes('dvo rr issued')) return 'DVORRIssued';
    if (s.includes('approved') && s.includes('dvo')) return 'ApprovedAwaitingDVO';
    if (s.includes('rsg') && s.includes('ffc')) return 'PendingWithRSGFFC';
    if (s.includes('with rsg')) return 'PendingWithRSG';
    if (s.includes('with ffc')) return 'PendingWithFFC';

    // Fallback based on column checks if status is empty but action notes imply something
    return 'PendingWithFFC';
}

function main() {
    const rawPath = path.join(__dirname, 'raw_input_v2.txt');
    const rawData = fs.readFileSync(rawPath, 'utf8');
    const lines = rawData.split('\n');
    const vos = [];

    // Skip header line
    const startLine = lines[0].startsWith('S.No') ? 1 : 0;

    for (let i = startLine; i < lines.length; i++) {
        let line = lines[i];
        if (!line.trim()) continue;

        // Handle quoted multiline strings if any (basic handling)
        // For now, assuming standard tab separation works mostly
        const parts = line.split('\t').map(p => p ? p.trim().replace(/^"|"$/g, '') : '');

        // Mapping based on user provided columns
        // 0: S.No
        // 1: Subject
        // 2: Submission Date
        // 3: Submission Type
        // 4: Submission Ref
        // 5: Response Ref
        // 6: Assessment Date (Often empty)
        // 7: Proposal Value
        // 8: RSG Assessment Value
        // 9: Final Approved Amount
        // 10: Status
        // 11: VOR Ref
        // 12: VOR Date
        // 13: DVO Ref
        // 14: DVO Date
        // 15: EMPI Date
        // 16: Remarks
        // 17: Live Action

        const subject = parts[1];
        if (!subject) continue;

        const submissionDate = parseDate(parts[2]);
        const submissionType = parts[3] || 'VO';
        const submissionReference = parts[4] === '-' ? null : parts[4];
        const responseReference = parts[5] === '-' ? null : parts[5];

        const proposalValue = parseCurrency(parts[7]);
        const assessmentValue = parseCurrency(parts[8]); // RSG Assessment column
        const approvedAmount = parseCurrency(parts[9]); // Final Approved Amount

        let status = mapStatus(parts[10]);

        // Fix for specific statuses that might be empty or mapped incorrectly
        if (parts[17]?.toLowerCase().includes('closed out') && status === 'PendingWithFFC') {
            // If live action says closed out but status column was weird
        }

        const vorReference = parts[11];
        // parts[12] is VOR Date
        const dvoReference = parts[13];
        const dvoIssuedDate = parts[14] ? parseDate(parts[14]) : null;

        const remarks = parts[16];
        const actionNotes = parts[17];

        vos.push({
            subject,
            submissionDate,
            submissionType,
            submissionReference,
            responseReference,
            proposalValue,
            assessmentValue,
            approvedAmount,
            status,
            vorReference,
            dvoReference,
            dvoIssuedDate,
            remarks,
            actionNotes
        });
    }

    // Write to JSON file
    fs.writeFileSync(path.join(__dirname, 'real-data.json'), JSON.stringify(vos, null, 2));
    console.log(`Parsed ${vos.length} records to real-data.json`);
}

main();
