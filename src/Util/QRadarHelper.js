import Config from './Config';

export function performAQLQuery(cep, lsid) {
    const select = 'SELECT\n';
    const fields = `\tqidname(qid) AS 'Event Name',\n\t"${cep}",\n\tlogsourcename(logsourceid) AS 'Log Source',\n\tsourceip AS 'Source IP',\n\tsourceport AS 'Source Port',\n\tdestinationip AS 'Destination IP',\n\tdestinationport AS 'Destination Port',\n\tsum(eventcount) AS 'Event Count'\n`;
    const from = 'FROM events\n';
    const where = `WHERE\n\tdevicetype=${lsid}\nAND\n\t"${cep}" IS NOT NULL\n`;
    const groupBy = `GROUP BY "${cep}"\n`;
    const last = 'LAST 5 MINUTES';
    const AQL = select + fields + from + where + groupBy + last;
    console.group('AQL');
    console.log(AQL);
    console.groupEnd();
    const aqlParam = 'value(aql)=' + encodeURIComponent(encodeURIComponent(AQL));
    this.openPopup(Config.aqlSearch + Config.aqlSearchDefaults + aqlParam);
}

export function openPopup(page) {
    console.log('Opening external window');
    const w = 800, h = 600;
    const top = window.top.outerHeight / 2 + window.top.screenY - (h / 2);
    const left = window.top.outerWidth / 2 + window.top.screenX - (w / 2);
    window.open(page, '', Config.popupSettings + 'width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
}

export function openCEPLink(id) {
    this.openPopup(Config.cepSearch + Config.cepSearchDefaults + id);
}

export function searchFlows(id, name) {
    const comment = `/* ${name} matches */\n`;
    const select = 'SELECT\n';
    const fields = `\thasoffense AS 'Offense',\n\tsourceip AS 'Source IP',\n\tsourceport AS 'Source Port',\n\tdestinationip AS 'Destination IP',\n\tdestinationport AS 'Destination Port',\n\tDATEFORMAT(starttime, 'yyyy-MM-dd HH:mm:ss') AS 'Start Time'\n`;
    const from = 'FROM flows\n';
    const where = `WHERE\n\tfullmatchlist IN (${id.filter(x => x).join(',')})\n`;
    const last = 'LAST 1 HOURS';
    const AQL = comment + select + fields + from + where + last;
    console.log(AQL);

    const aqlParam = 'value(aql)=' + encodeURIComponent(encodeURIComponent(AQL));
    this.openPopup(Config.aqlSearch + Config.aqlSearchDefaultsFlow + aqlParam);
}

export function searchEvents(id, name) {
    const comment = `/* ${name} matches */\n`;
    const select = 'SELECT\n';
    const fields = `\thasoffense AS 'Offense',\n\tsourceip AS 'Source IP',\n\tsourceport AS 'Source Port',\n\tdestinationip AS 'Destination IP',\n\tdestinationport AS 'Destination Port',\n\tDATEFORMAT(starttime, 'yyyy-MM-dd HH:mm:ss') AS 'Start Time',\neventcount AS 'Event Count'\n`;
    const from = 'FROM events\n';
    const where = `WHERE\n\tcreeventlist IN (${id.filter(x => x).join(',')})\n`;
    const last = 'LAST 1 HOURS';
    const AQL = comment + select + fields + from + where + last;
    console.log(AQL);

    const aqlParam = 'value(aql)=' + encodeURIComponent(encodeURIComponent(AQL));
    this.openPopup(Config.aqlSearch + Config.aqlSearchDefaults + aqlParam);
}