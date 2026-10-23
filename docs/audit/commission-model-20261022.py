"""Reproduce a planning estimate, not an invoice, tax return, or runtime policy."""
from decimal import Decimal as D, ROUND_HALF_UP
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import math
import subprocess

ROOT = Path(__file__).resolve().parents[2]
price = D('10000')
fixed = D('150000')
pg = D('0.034') * D('1.1')
risk = D('0.01')
vat = D('0.10')
fx_with_vat = D('1400') * D('1.1')
base_aws = D('0.0468') * 730 + D('0.0912') * 50 + D('0.005') * 730
won = lambda value: int(value.quantize(D('1'), rounding=ROUND_HALF_UP))
rows = []
for count in (20, 100, 200, 400, 1155):
    gross = price * count
    gb = D(count) * 100 * 60 * 4 / 8 / 1000 * D('1.1')
    aws = (base_aws + max(D('0'), gb - 100) * D('0.126')) * fx_with_vat
    rows.append({
        'subscriptions': count, 'grossKRW': won(gross), 'outboundGB': float(gb),
        'directEc2AwsOnlyKRW': won(aws),
        'requiredAllInFeePercent': float(((fixed / gross + pg + risk) * (1 + vat) * 100).quantize(D('.01'))),
        'fees': [{
            'ratePercent': int(c * 100), 'deductionKRW': won(gross * c),
            'creatorBeforeOwnTaxesKRW': won(gross * (1 - c)),
            'balanceAfterBudgetAndReservesKRW': won(gross * (c / (1 + vat) - pg - risk) - fixed),
            'directEc2BalanceBeforeOtherCostsKRW': won(gross * (c / (1 + vat) - pg - risk) - aws),
        } for c in (D('.10'), D('.15'), D('.20'))],
    })

margin10 = D('.10') / (1 + vat) - pg - risk
breakeven = math.ceil(fixed / (price * margin10))
price_sensitivity = []
for monthly_price in (5000, 9900, 10000, 14900):
    needed = math.ceil(fixed / (D(monthly_price) * margin10))
    assert (needed - 1) * D(monthly_price) * margin10 < fixed <= needed * D(monthly_price) * margin10
    price_sensitivity.append({'monthlyPriceKRW': monthly_price, 'paidSubscriptions': needed, 'creatorsAt50PaidSubscriptionsEach': math.ceil(needed / 50)})
assert sum((5, 50, 100, 1000)) == 1155
assert base_aws == D('42.374')
assert (breakeven - 1) * price * margin10 < fixed <= breakeven * price * margin10
assert rows[3]['fees'][0]['balanceAfterBudgetAndReservesKRW'] == 24036
assert rows[4]['fees'][0]['balanceAfterBudgetAndReservesKRW'] == 352530

record = {
    'checkedAt': datetime.now(timezone.utc).isoformat(),
    'scope': 'Research and arithmetic only; no financial policy, cloud resources, or production data changed',
    'repository': {'path': str(ROOT), 'branch': subprocess.check_output(['git', 'branch', '--show-current'], cwd=ROOT, text=True).strip(), 'head': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip(), 'dirty': bool(subprocess.check_output(['git', 'status', '--porcelain'], cwd=ROOT, text=True).strip())},
    'scriptSha256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
    'inputs': {'subscriptionPriceKRW': 10000, 'fixedMonthlyBudgetKRW': 150000, 'pgPublishedRate': 0.034, 'pgCashRateIncludingVat': float(pg), 'lossReserveRate': 0.01, 'commissionVatAssumption': 0.10, 'inputVatCreditAssumed': 0, 'fxBudgetKRWPerUSD': 1400, 'usdPricesTaxMultiplier': 1.1, 'minutesPerSubscription': 100, 'averageMbps': 4, 'transferHeadroom': 1.1, 'availableSharedAwsFreeOutboundGB': 100, 'ec2FirstTierOutboundUSDPerGB': 0.126, 'ec2BaseMonthlyUSD': float(base_aws)},
    'formula': 'G = monthly paid subscriptions * price; balance = G * (all-in commission / 1.1 - 0.0374 - 0.01) - F; required commission = 1.1 * (F/G + 0.0374 + 0.01)',
    'rows': rows,
    'tenPercentBreakevenSubscriptions': breakeven,
    'priceSensitivityAtTenPercent': price_sensitivity,
    'fixedBudgetSensitivity': [{'fixedKRW': f, 'tenPercentBreakEvenSubscriptions': math.ceil(D(f) / (price * margin10))} for f in (100000, 150000, 200000, 300000)],
    'sources': [
        {'url': 'https://www.pd-ing.com/', 'method': 'Official page search-index text; direct extraction rendered app shell', 'claim': 'Creator share General 80%, Best 85%, Partner 90%; infer platform 20%,15%,10%'},
        {'url': 'https://legal.pd-ing.com/terms-of-service', 'method': 'Official current page full text', 'claim': 'Fees vary; processing, disbursement, conversion fees described, numeric total not public; prepaid individual purchases, not recurring subscriptions'},
        {'url': 'https://committees.parliament.uk/writtenevidence/40780/default/', 'method': 'Company submission hosted by UK Parliament; historical 2021 primary source', 'claim': 'OnlyFans fee 20% of fan payments excluding VAT element; creator share80%'},
        {'url': 'https://www.theguardian.com/commentisfree/2026/jun/18/the-guardian-view-on-onlyfans-revelations-of-abusive-middlemen-merit-mps-attention', 'method': '2026-06-18 secondary corroboration', 'claim': 'OnlyFans platform commission20%; latest official terms direct access unavailable'},
        {'url': 'https://www.tosspayments.com/about/fee', 'method': 'Official published pricing', 'claim': 'General cards3.4% VAT excluded; actual billing/marketplace contract may differ; joining220000 and annual110000KRW contract-dependent'},
        {'url': 'https://aws.amazon.com/cloudfront/pricing/', 'method': 'Official current pricing', 'claim': 'Pro15USD per distribution/month,50TB and10M requests; not complete system cost'},
        {'url': 'https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/flat-rate-pricing-plan.html', 'method': 'Official current documentation', 'claim': 'Private S3 OAC and signed URLs available; usage/eligibility/feature limits still need deployment validation'},
        {'url': 'https://aws.amazon.com/ec2/pricing/on-demand/', 'method': 'Official current policy plus prior-day AWS Calculator evidence ec2-beta-cost-20261021.json', 'claim': '100GB internet free allowance shared across AWS; Seoul first-tier rate from calculator0.126USD/GB'},
        {'url': 'https://d.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7693&mi=2401', 'method': 'National Tax Service general guidance', 'claim': 'General VAT10%, input tax credit exists; not a determination of this business tax/merchant structure'},
    ],
    'limits': [
        'Initial creator count, member price, actual view bitrate/minutes and supplier contracts not confirmed',
        '150000KRW is a CDN-enabled planning budget, not a measured current monthly bill; CDN not deployed by this research',
        'Cloud reference about117277KRW = current EC2base42.374 + CDN15 + prior modeled transcoding6.8 + storage1.98 + backup5 + miscellaneous5 USD, times1540; prior2026-10-08 storage/transcoding rates not freshly requoted',
        'Remaining about32723KRW inside150000 is a provisional allowance, not confirmed PASS, mail, banking or PG annual fees',
        'No founder/staff salary, marketing, legal/accounting retainers, corporate/income tax, initial setup fees or catastrophic chargeback loss; no staffing sustainability claim',
        'Commission VAT reserve assumes taxable intermediary commission; ignores input credits conservatively; merchant-of-record structure and creator taxes require confirmation',
        '1% loss reserve is a chosen sensitivity assumption, not observed refund frequency; G should use successfully collected non-refunded revenue, reserve covers unrecovered losses',
        'OnlyFans current official terms browser blocked by site policy; no workaround attempted; historical primary and recent secondary evidence distinguished',
        'PDing headline platform fees are not verified all-inclusive charges; currency/points/tax bases differ',
        'DirectEC2 rows estimate bandwidth charges only with assumed unused100GB allowance; capacity/disk sufficiency and other internet traffic are not proven',
    ],
    'checks': {'decimalArithmetic': 'PASS', 'knownExample400And1155': 'PASS', 'integerBreakevenBoundary344vs345': 'PASS', 'priceSensitivityIntegerBoundaries': 'PASS'},
}
output = Path(__file__).with_suffix('.json')
output.write_text(json.dumps(record, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'result': 'PASS', 'rows': len(rows), 'breakevenSubscriptions': breakeven, 'output': str(output)}))
