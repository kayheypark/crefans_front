"""Budget sensitivity, not AWS quotes, measured capacity, or a profit forecast."""
from datetime import datetime, timezone
from decimal import Decimal as D, ROUND_CEILING, ROUND_HALF_UP
from pathlib import Path
import hashlib
import json
import platform
import subprocess

ROOT = Path(__file__).resolve().parents[2]
now = lambda: datetime.now(timezone.utc).isoformat()
won = lambda x: int(x.quantize(D(1), rounding=ROUND_HALF_UP))
margin = D(9900) * (D('.20') / D('1.1') - D('.0374') - D('.01'))
assert margin == D('1330.74')
rows = []
for creators, per_creator, low, high in (
    (3, 10, 150000, 200000), (5, 20, 150000, 200000),
    (5, 50, 150000, 250000), (10, 50, 200000, 300000),
    (20, 50, 300000, 500000), (30, 100, 500000, 1000000),
    (50, 100, 800000, 1500000),
):
    count = creators * per_creator
    rows.append({'creators': creators, 'paidSubscriptionsEach': per_creator,
                 'paidSubscriptions': count, 'grossKRW': count * 9900,
                 'budgetInputKRW': [low, high],
                 'balanceRangeKRW': [won(count * margin - high), won(count * margin - low)],
                 'outboundTBAt100Minutes4Mbps': float(D(count) * D('3.3') / 1000)})
boundaries = []
for budget in (150000, 200000, 300000, 500000, 1000000):
    needed = int((D(budget) / margin).to_integral_value(rounding=ROUND_CEILING))
    assert (needed - 1) * margin < budget <= needed * margin
    boundaries.append({'budgetKRW': budget, 'neededSubscriptions': needed})
direct_1000 = (D('42.374') + (3300 - 100) * D('.126')) * 1400 * D('1.1')
assert won(direct_1000) == 686184
assert rows[4]['balanceRangeKRW'] == [830740, 1030740]
assert rows[-1]['outboundTBAt100Minutes4Mbps'] == 16.5
record = {
    'checkedAt': now(), 'environment': {'os': platform.platform(), 'python': platform.python_version()},
    'repository': {'path': str(ROOT), 'branch': subprocess.check_output(['git', 'branch', '--show-current'], cwd=ROOT, text=True).strip(),
                   'head': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip(),
                   'dirty': bool(subprocess.check_output(['git', 'status', '--porcelain'], cwd=ROOT, text=True).strip())},
    'scope': 'Research, planning sensitivity, and documents only; no runtime, pricing policy, infrastructure or deployment changes',
    'inputs': {'priceKRW': 9900, 'allInCommission': .20, 'pgCashRate': .0374, 'commissionVatDivisor': 1.1, 'lossReserveRate': .01,
               'budgetRangesAreChosenScenariosNotQuotes': True, 'minutesPerPaidSubscription': 100, 'Mbps': 4, 'transferHeadroom': 1.1},
    'formula': 'N * 9900 * (0.20 / 1.1 - 0.0374 - 0.01) - budget',
    'contributionPerSubscriptionKRW': float(margin), 'rows': rows, 'boundaries': boundaries,
    'directEc21000SubscriptionsAwsOnlyKRW': won(direct_1000),
    'sourcesChecked20261022': [
        {'url': 'https://aws.amazon.com/cloudfront/pricing/', 'finding': 'Pro15USD per distribution monthly;50TB,10Mrequests allowance;S3storagecredit50GB'},
        {'url': 'https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/flat-rate-pricing-plan.html', 'finding': 'OAC and signedURLs available onPro; sustained allowance excess can affect delivery; history-based eligibility'},
        {'url': 'https://docs.aws.amazon.com/autoscaling/ec2/userguide/as-scale-based-on-demand.html', 'finding': 'Scale on load metrics such asCPU and requests per target; no paid-member capacity guarantee'},
        {'url': 'https://aws.amazon.com/s3/pricing/', 'finding': 'Storage amount/duration, requests and other operations incur costs separately'},
        {'url': 'https://aws.amazon.com/ec2/pricing/on-demand/', 'finding': 'Shared100GB internet allowance and additional charges; regional unit prices reused from previous-day AWS calculator evidence'},
    ],
    'limits': ['Budget ranges are judgmental scenario inputs, NOT itemizedAWS quotes or measured costs',
               'No live remote telemetry or load tests; current runtime only reviewed from existing deployment records',
               'Low cost scenarios assume privateS3/CDN separation not yet deployed; current directEC2 video delivery can exceed these budgets',
               'Free traffic, concurrency, requests, video viewing time, uploads, retained originals, encoding and uptime objectives unknown',
               'No founder/staff pay, marketing, legal/accounting retainers, income tax or setup costs; no profit assurance',
               'An extra100minutes or additional bitrates alter delivery/storage;5000subscriptions at400minutes =66TB exceedsPro data allowance',
               'PG/tax/loss assumptions retained for comparison, not final merchant/tax advice or contract',
               'Earlier documentation hashes are historical after this append'],
    'checks': {'decimalArithmetic': 'PASS', 'integerBudgetBoundaries': 'PASS', 'known1000Case': 'PASS', 'transferCalculation': 'PASS'},
    'commands': [],
}
out = Path(__file__).with_suffix('.json')
out.write_text(json.dumps(record, ensure_ascii=False, indent=2) + '\n')
for cmd in (['npm', 'run', 'docs:record'], ['npm', 'run', 'check:docs'], ['git', 'diff', '--check']):
    started = now()
    result = subprocess.run(cmd, cwd=ROOT, text=True, capture_output=True)
    output = result.stdout + result.stderr
    record['commands'].append({'command': ' '.join(cmd), 'startedAt': started, 'finishedAt': now(),
                               'exitCode': result.returncode, 'outputSha256': hashlib.sha256(output.encode()).hexdigest(), 'summary': output.strip()})
    out.write_text(json.dumps(record, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'command': ' '.join(cmd), 'exitCode': result.returncode, 'output': output.strip()}, ensure_ascii=False), flush=True)
    if result.returncode:
        raise SystemExit(result.returncode)
record['filesSha256'] = {str(p.relative_to(ROOT)): hashlib.sha256(p.read_bytes()).hexdigest()
                        for p in (Path(__file__), ROOT / 'docs/financial.md', ROOT / 'PROGRESS.md', ROOT / 'docs/audit/manifest.json')}
record['result'] = 'PASS within arithmetic and document scope; no runtime/live-provider tests'
out.write_text(json.dumps(record, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'result': 'PASS', 'rows': len(rows), 'boundaries': boundaries, 'output': str(out)}))
