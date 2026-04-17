<template>
  <view class="container">
    <!-- 顶部Header -->
    <view class="header">
      <text class="page-title">📖 帮助中心</text>
    </view>

    <!-- 内容区 -->
    <scroll-view class="content" scroll-y>
      <!-- Tab 0: 279分销机制完整文档 -->
      <view v-if="activeTab === 0" class="help-section">

        <!-- 文档引言 -->
        <view class="doc-intro">
          <text>👋 亲爱的朋友，非常感谢你关注</text><text class="highlight-key">云南6天5晚跟团游</text><text>分销项目！全程零复杂操作、零额外投入，只要购买</text><text class="highlight-money">799元</text><text>云南跟团游套餐，就能直接解锁279分销权益，一边畅游云南美景，一边轻松赚取额外收益💰 本说明书将结合真实案例，详细拆解279机制的每一个细节，新手也能对照案例快速上手、轻松赚钱～</text>
        </view>

        <!-- 一、加入条件 -->
        <view class="section-title-bar">🎯 一、加入条件（超简单，人人可参与）</view>
        <view class="body-text">无需门槛、无需额外缴费，不用具备任何推广经验，只要你购买<text class="highlight-money">799元云南6天5晚跟团游套餐</text>，系统会自动为你开通分销权限，成为分销会员，立即解锁所有分销权益（分润💰、成团奖🏆、永久分红📈），真正实现"旅行、赚钱两不误"，无论你是上班族👨‍💼、宝妈👩‍👧还是学生🎓，人人都能参与！</view>

        <!-- 二、核心279分销机制 -->
        <view class="section-title-bar">🚀 二、核心279分销机制（3个关键点+案例详解，一看就懂）</view>
        <view class="body-text intro-para">很多朋友问，279到底是什么？其实它不是复杂的数字游戏，而是"轻松回本💵、稳定赚钱📈、长期受益💎"的核心逻辑，每一步都为新手考虑，不用费脑，结合案例一看就懂、一学就会！</view>

        <!-- 1. 「2」二级分润 -->
        <view class="mech-block">
          <view class="mech-title"><text class="mech-num">1</text><text class="mech-key">「2」</text>二级分润，<text class="highlight-key">2单</text>轻松回本</view>
          <view class="mech-advantage">💡 核心优势：只需分享<text class="highlight-key">2单</text>，就能赚回<text class="highlight-money">799元</text>套餐费，后续每多分享1单，全是纯利润！</view>
          <view class="mech-content">
            <view class="mech-sub">
              <text class="sub-title">📌 二级分润定义：</text>
              <text>仅包含"你直接分享的朋友（一级，直推）"和"你朋友再分享的朋友（二级，间推）"，无三级及以上分润，合规又省心，多劳多得📊</text>
            </view>
            <view class="mech-sub">
              <text class="sub-title">🎯 直推分润：</text>
              <text>你直接分享海报/二维码，朋友扫码购买<text class="highlight-money">799元</text>套餐后，你能获得的奖励，规则为「<text class="highlight-pct">第1单30%</text>、<text class="highlight-pct">第2单70%</text>，第3单起循环<text class="highlight-pct">30%、70%</text>」。</text>
            </view>
            <view class="case-box">
              <text class="case-tag">💰 案例1</text>
              <text>购买套餐成为分销会员后，分享海报给朋友A，A下单购买，你获得<text class="highlight-pct">直推奖30%</text>，即<text class="highlight-money">799×30%=239.7元</text>；再分享给朋友B，B下单购买，你获得<text class="highlight-pct">直推奖70%</text>，即<text class="highlight-money">799×70%=559.3元</text>；两单合计<text class="highlight-money">239.7+559.3=799元</text>，刚好赚回套餐费，实现"免费游云南"🎉</text>
            </view>
            <view class="case-box">
              <text class="case-tag">🔄 案例2</text>
              <text>分享第3单给朋友C，获得<text class="highlight-pct">30%直推奖（239.7元）</text>；第4单分享给朋友D，获得<text class="highlight-pct">70%直推奖（559.3元）</text>，循环往复，后续每分享1单，都能稳定赚取收益，全是纯利润✨</text>
            </view>
            <view class="mech-sub">
              <text class="sub-title">🔗 间推分润：</text>
              <text>你分享的朋友（直推用户）再分享给他们的朋友（间推用户），间推用户下单后，你能获得固定<text class="highlight-pct">10%</text>的奖励，不用你额外费心推广，躺着就能赚被动收益💤</text>
            </view>
            <view class="case-box">
              <text class="case-tag">🌐 间推案例</text>
              <text>分享海报给朋友A（直推），A成为分销会员后，又分享给朋友A1（间推），A1下单购买<text class="highlight-money">799元</text>套餐，你能获得<text class="highlight-pct">间推奖10%</text>，即<text class="highlight-money">799×10%=79.9元</text>；如果A再分享给A2、A3，每一位间推用户下单，你都能获得<text class="highlight-money">79.9元</text>，多一位间推，多一份收益📈</text>
            </view>
            <view class="warning-box">
              <text class="warning-tag">⚠️ 注意</text>
              <text>仅二级分润，若A1再分享给A11，A11下单后，你不获得分润，仅A能获得A11的直推分润，避免多层套路，合规保障所有用户权益🛡️</text>
            </view>
          </view>
        </view>

        <!-- 2. 「7」七人成团 -->
        <view class="mech-block">
          <view class="mech-title"><text class="mech-num">2</text><text class="mech-key">「7」</text><text class="highlight-key">7人成团</text>，解锁高额奖励</view>
          <view class="mech-advantage">💡 核心优势：组建<text class="highlight-key">7人小团队</text>，就能轻松拿<text class="highlight-money">800元成团奖</text>，多成团、多赚钱，收益上不封顶🏆</view>
          <view class="mech-content">
            <view class="mech-sub">
              <text class="sub-title">📌 成团定义：</text>
              <text>以你为团长，邀请<text class="highlight-key">6位有效用户</text>（通过你的专属二维码下单购买套餐的用户），凑够<text class="highlight-key">7人</text>，即为成功成团，成团后可领取高额奖励，且能循环开团、循环拿奖🔄</text>
            </view>
            <view class="mech-sub">
              <text class="sub-title">📋 成团规则：</text>
              <text>团长1人+有效下级6人=<text class="highlight-key">7人成团</text>；有效下级仅计算"通过你的专属二维码下单、无退款、无违规"的用户，同一设备/同一IP仅算1位有效用户，避免刷团🚫</text>
            </view>
            <view class="case-box">
              <text class="case-tag">👥 成团案例</text>
              <text>作为团长，分享海报给朋友A、B、C、D、E、F，<text class="highlight-key">6位朋友</text>均通过你的二维码下单购买<text class="highlight-money">799元</text>套餐，且无退款，此时你和6位朋友凑够<text class="highlight-key">7人</text>，成功成团，可立即领取成团奖🎉</text>
            </view>
            <view class="mech-sub">
              <text class="sub-title">💰 成团奖励：</text>
              <text>每成功组建<text class="highlight-key">1个团</text>，你就能直接领取<text class="highlight-money">800元成团奖</text>，奖励实时到账，可直接提现，也能抵扣旅行费用，怎么用都划算💵</text>
            </view>
            <view class="case-box">
              <text class="case-tag">💵 奖励案例</text>
              <text>成功组建<text class="highlight-key">1个7人团</text>，系统立即发放<text class="highlight-money">800元成团奖</text>到你的账户，此时你不仅赚回了<text class="highlight-money">799元</text>套餐费，还净赚<text class="highlight-money">1元</text>；若你组建<text class="highlight-key">2个团</text>，就能获得<text class="highlight-money">800×2=1600元</text>，组建<text class="highlight-key">3个团</text>获得<text class="highlight-money">2400元</text>，以此类推📈</text>
            </view>
            <view class="mech-sub">
              <text class="sub-title">🔄 循环收益：</text>
              <text>成团后你自动"出局"，系统会自动为你开启新团，你可以继续邀请朋友、发展下级，凑够<text class="highlight-key">7人</text>再次成团，循环拿成团奖，收益无上限、赚钱不设限♻️</text>
            </view>
            <view class="case-box">
              <text class="case-tag">♻️ 循环案例</text>
              <text>第一次成团后，出局并开启新团，再邀请朋友G、H、I、J、K、L <text class="highlight-key">6人下单</text>，凑够<text class="highlight-key">7人</text>再次成团，又能领取<text class="highlight-money">800元成团奖</text>，只要持续推广，就能持续拿奖🚀</text>
            </view>
          </view>
        </view>

        <!-- 3. 「9」永久分红 -->
        <view class="mech-block">
          <view class="mech-title"><text class="mech-num">3</text><text class="mech-key">「9」</text>永久分红，长期稳定收益</view>
          <view class="mech-advantage">💡 核心优势：只要解锁分红资格，就能终身享受平台收益，不用持续推广，也能稳定赚零花钱💎</view>
          <view class="mech-content">
            <view class="mech-sub">
              <text class="sub-title">📌 分红定义：</text>
              <text>平台每月从总营业额中提取部分利润，分配给所有解锁分红资格的分销会员，只要解锁资格，终身可享，无需持续推广，躺着就能赚长期收益📈</text>
            </view>
            <view class="mech-sub">
              <text class="sub-title">🔓 解锁条件（二选一，超容易达成）：</text>
              <text>① 直推满<text class="highlight-key">2位有效用户</text>（通过你的二维码下单、无退款）；② 成功组建<text class="highlight-key">1个7人团</text>。</text>
            </view>
            <view class="case-box">
              <text class="case-tag">🎯 解锁案例</text>
              <text>你直推了朋友A和朋友B，两位均下单无退款，此时你解锁分红资格；或者你成功组建<text class="highlight-key">1个7人团</text>，也能直接解锁分红资格，两种方式任选其一，轻松达成✅</text>
            </view>
            <view class="mech-sub">
              <text class="sub-title">🎁 分红福利（3种福利，叠加享受）：</text>
            </view>
            <view class="bonus-list">
              <view class="bonus-item">
                <text class="bonus-num">①</text>
                <view class="bonus-content">
                  <text class="bonus-title">🏦 平台业绩分红</text>
                  <text class="bonus-desc">每月平台总营业额的<text class="highlight-pct">2%</text>，所有解锁分红资格的会员均分，多劳者多得（你的团队越大、推广的订单越多，分到的分红越多）。</text>
                  <text class="bonus-example">📊 案例：当月平台总营业额为<text class="highlight-money">100万元</text>，提取<text class="highlight-pct">2%</text>即<text class="highlight-money">2万元</text>作为业绩分红；若当月有<text class="highlight-key">100位</text>会员解锁分红资格，平均每人可分到<text class="highlight-money">200元</text>；若你推广的订单占平台总订单的<text class="highlight-pct">5%</text>，则你能分到<text class="highlight-money">1000元</text>，推广越多，分红越多💰</text>
                </view>
              </view>
              <view class="bonus-item">
                <text class="bonus-num">②</text>
                <view class="bonus-content">
                  <text class="bonus-title">🏆 成团专项分红</text>
                  <text class="bonus-desc">你的团队每新增<text class="highlight-key">1个7人团</text>，你额外再赚该团总交易额的<text class="highlight-pct">2%</text>，团队越大，分红越多。</text>
                  <text class="bonus-example">📊 案例：你的直推用户A，成功组建<text class="highlight-key">1个7人团</text>，该团总交易额为<text class="highlight-money">799×7=5593元</text>，你能获得专项分红<text class="highlight-money">5593×2%≈111.86元</text>；若A每月组建<text class="highlight-key">2个团</text>，你每月能额外获得<text class="highlight-money">约223.72元</text>专项分红，团队下属成团越多，你赚得越多📈</text>
                </view>
              </view>
              <view class="bonus-item">
                <text class="bonus-num">③</text>
                <view class="bonus-content">
                  <text class="bonus-title">👑 直推管理津贴</text>
                  <text class="bonus-desc">永久享受你直推用户所有收益的<text class="highlight-pct">10%</text>，他们赚得越多，你能拿到的补贴就越多，轻松实现"躺赚"💤</text>
                  <text class="bonus-example">📊 案例：你直推的朋友A，当月赚了<text class="highlight-money">1000元</text>（直推分润+成团奖），你能获得管理津贴<text class="highlight-money">1000×10%=100元</text>；若A当月赚了<text class="highlight-money">2000元</text>，你能获得<text class="highlight-money">200元</text>津贴，只要A持续赚钱，你就能持续获得津贴，终身有效✅</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 三、分享赚钱小技巧 -->
        <view class="section-title-bar">�share 三、分享赚钱小技巧（零门槛，人人会做）</view>
        <view class="body-text intro-para">成为分销会员后，不用费脑想文案、做海报，点击小程序「📤分享机会，一起旅行一起赚」，一键分享就能发展团队、赚取收益，步骤超简单📱</view>
        <view class="step-list">
          <view class="step-item">
            <view class="step-num">1</view>
            <view class="step-body">
              <text class="step-title">📢 选择分享渠道</text>
              <text class="step-desc">选择想要分享的渠道（微信群/朋友圈/抖音），系统会自动复制适配该渠道的利他文案、生成你的专属推广海报，并自动存入手机相册（无需你手动制作海报、编辑文案）✨</text>
              <view class="case-box inline">
                <text class="case-tag">💬 案例</text>
                <text>你想分享到朋友圈，点击"分享到朋友圈"按钮，系统自动复制朋友圈专属文案，生成带你专属二维码的云南风景海报，自动保存到你的手机相册，全程<text class="highlight-key">1秒</text>完成⚡</text>
              </view>
            </view>
          </view>
          <view class="step-item">
            <view class="step-num">2</view>
            <view class="step-body">
              <text class="step-title">📨 发送海报</text>
              <text class="step-desc">在对应平台粘贴文案、发送海报，朋友扫描海报上的二维码下单后，会自动成为你的团队成员，直接计入你的<text class="highlight-key">7人团点位</text>，无需你手动绑定🔗</text>
              <view class="case-box inline">
                <text class="case-tag">💬 案例</text>
                <text>把复制的文案和保存的海报，发送到朋友圈，朋友A看到后，扫描海报上的二维码，下单购买<text class="highlight-money">799元</text>套餐，系统自动将A绑定为你的直推用户，计入你的<text class="highlight-key">7人团</text>，你无需做任何额外操作🙌</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 四、收益结算与提现 -->
        <view class="section-title-bar">💳 四、收益结算与提现（透明无套路，放心赚）</view>
        <view class="body-text intro-para">所有收益结算、提现流程透明，无任何隐藏套路，每一笔收益都能实时查看，结合案例理解更清晰🧾</view>

        <view class="settlement-item">
          <view class="settlement-title">💰 分润结算</view>
          <text class="settlement-desc">朋友下单并完成出行（无退款、无违规）后，分润会自动打入你的账户，无需手动申请，结算周期以用户完成为准。</text>
          <view class="case-box inline">
            <text class="case-tag">📅 案例</text>
            <text>你直推的朋友A，5月10日下单购买套餐，5月20日完成云南6天5晚旅行，无退款、无违规，系统会在<text class="highlight-key">5月21日</text>自动将<text class="highlight-money">239.7元</text>直推奖打入你的账户，你可实时查看到账记录✅</text>
          </view>
        </view>

        <view class="settlement-item">
          <view class="settlement-title">🏆 成团奖结算</view>
          <text class="settlement-desc"><text class="highlight-key">7人团</text>凑满、所有成员均完成真实支付（无退款、无违规）后，<text class="highlight-money">800元成团奖</text>立即到账，实时可查，无需等待⚡</text>
          <view class="case-box inline">
            <text class="case-tag">📅 案例</text>
            <text>你邀请的<text class="highlight-key">6位朋友</text>均在5月15日下单，且无退款，当天凑够<text class="highlight-key">7人成团</text>，系统立即将<text class="highlight-money">800元</text>成团奖打入你的账户，你可随时查看、提现💰</text>
          </view>
        </view>

        <view class="settlement-item">
          <view class="settlement-title">📈 分红结算</view>
          <text class="settlement-desc">每月<text class="highlight-key">5日</text>统一结算上月分红，结算完成后自动打入你的账户，无需催更，分红明细可在小程序"我的收益"中查看🗓️</text>
          <view class="case-box inline">
            <text class="case-tag">📅 案例</text>
            <text>6月份你解锁了分红资格，当月平台业绩分红总额为<text class="highlight-money">2万元</text>，你分到<text class="highlight-money">1000元</text>，<text class="highlight-key">7月5日</text>系统会自动将<text class="highlight-money">1000元</text>分红打入你的账户，同时显示分红明细（总营业额、均分比例、你的分红金额）📊</text>
          </view>
        </view>

        <view class="settlement-item">
          <view class="settlement-title">🏧 提现规则</view>
          <text class="settlement-desc">账户余额满<text class="highlight-money">100元</text>即可申请提现，<text class="highlight-key">T+1到账</text>微信零钱，仅收取<text class="highlight-pct">1%</text>手续费（最低<text class="highlight-money">1元</text>），操作简单、流程透明，实时查看提现进度💳</text>
          <view class="case-box inline">
            <text class="case-tag">💰 案例1</text>
            <text>你的账户余额有<text class="highlight-money">100元</text>，申请提现后，扣除<text class="highlight-pct">1%</text>手续费（<text class="highlight-money">1元</text>），实际到账<text class="highlight-money">99元</text>，次日即可在微信零钱中收到✅</text>
          </view>
          <view class="case-box inline">
            <text class="case-tag">💰 案例2</text>
            <text>你的账户余额有<text class="highlight-money">500元</text>，申请提现后，扣除<text class="highlight-pct">1%</text>手续费（<text class="highlight-money">5元</text>），实际到账<text class="highlight-money">495元</text>，<text class="highlight-key">T+1到账</text>，无任何额外费用🙌</text>
          </view>
        </view>

        <!-- 五、常见疑问 -->
        <view class="section-title-bar">❓ 五、常见疑问（新手必看）</view>

        <view class="qa-section">
          <view class="qa-item">
            <view class="qa-q">Q：我没有任何推广经验，能做好分销吗？🤔</view>
            <view class="qa-a">A：完全可以！全程一键分享、自动配图，不用你写文案、做海报，只要把靠谱的旅行机会分享给喜欢旅行的朋友，就能轻松赚钱，新手也能快速上手💪</view>
            <view class="case-box inline">
              <text class="case-tag">📝 补充案例</text>
              <text>宝妈小李，没有任何推广经验，购买套餐后，每天在朋友圈分享<text class="highlight-key">1次</text>海报，<text class="highlight-key">1个月</text>内分享了<text class="highlight-key">30次</text>，成功直推<text class="highlight-key">2位</text>朋友，解锁了分红资格，还赚了<text class="highlight-money">479.4元</text>（239.7+239.7），轻松补贴家用💰</text>
            </view>
          </view>

          <view class="qa-item">
            <view class="qa-q">Q：分享后没人下单，也能拿到<text class="highlight-money">0.5元</text>分享奖励吗？🤨</view>
            <view class="qa-a">A：可以的！只要是有效分享（朋友点击你的海报并停留<span class="highlight-key">≥3秒</span>），哪怕没有下单，也能拿到<text class="highlight-money">0.5元</text>奖励，轻松赚补贴🪙</view>
            <view class="case-box inline">
              <text class="case-tag">📝 补充案例</text>
              <text>上班族小王，每天分享<text class="highlight-key">5次</text>海报到不同的微信群，每次都有朋友点击海报停留≥3秒，哪怕没有朋友下单，他每天也能赚<text class="highlight-money">5×0.5=2.5元</text>，每月能赚<text class="highlight-money">75元</text>，轻松补贴交通费🚌</text>
            </view>
          </view>

          <view class="qa-item">
            <view class="qa-q">Q：成团后，我还能继续做分销、赚收益吗？🔄</view>
            <view class="qa-a">A：当然可以！团长出局后，系统会自动为你开启新团，你可以继续邀请朋友，循环拿成团奖、分润和分红，收益没有上限♻️</view>
            <view class="case-box inline">
              <text class="case-tag">📝 补充案例</text>
              <text>退休张阿姨，成功组建<text class="highlight-key">1个团</text>，拿到<text class="highlight-money">800元</text>成团奖后，继续推广，<text class="highlight-key">3个月</text>内一共组建了<text class="highlight-key">4个团</text>，仅成团奖就赚了<text class="highlight-money">800×4=3200元</text>，还能享受分红和分润，实现"退休也能赚零花钱"💵</text>
            </view>
          </view>

          <view class="qa-item">
            <view class="qa-q">Q：如果朋友下单后退款了，会影响我的分润和成团吗？😟</view>
            <view class="qa-a">A：会的。退款订单不计入分润结算，也不算入<text class="highlight-key">7人团点位</text>，这样能有效避免虚假操作，保障所有分销会员的合法收益🛡️</view>
            <view class="case-box inline">
              <text class="case-tag">📝 补充案例</text>
              <text>你邀请朋友A下单，A下单后申请退款，那么你无法获得A的直推分润，A也不能计入你的<text class="highlight-key">7人团</text>点位；若你已经凑够<text class="highlight-key">7人</text>，其中<text class="highlight-key">1人退款</text>，那么成团失败，需重新邀请1位有效用户才能成团❌</text>
            </view>
          </view>

          <view class="qa-item">
            <view class="qa-q">Q：我的专属二维码，能长期使用吗？🔗</view>
            <view class="qa-a">A：可以的！你的专属二维码永久有效，绑定你的用户ID，无论朋友什么时候扫描你的二维码下单，都能自动成为你的直推用户，计入你的团队，终身绑定📌</view>
            <view class="case-box inline">
              <text class="case-tag">📝 补充案例</text>
              <text>你3月份分享了海报，朋友A在<text class="highlight-key">6月份</text>才看到海报、扫描你的二维码下单，此时A仍为你的直推用户，你能获得直推分润，若A后续发展团队、成团，你也能获得管理津贴和专项分红📈</text>
            </view>
          </view>
        </view>

        <!-- 六、总结 -->
        <view class="summary-block">
          <view class="summary-title">🏆 六、总结</view>
          <view class="summary-text"><text class="summary-money">799元</text>=云南6天5晚跟团游+279分销权益，结合案例来看，<text class="summary-key">2单</text>就能回本、<text class="summary-key">7人</text>就能拿高额成团奖、解锁资格就能享永久分红，全程零门槛、零套路、零额外投入，不用费脑、不用推广经验，分享就能赚💰</view>
          <view class="summary-cta">现在购买套餐，立即成为分销会员，把这份靠谱的旅行和赚钱机会分享给身边的朋友，一边畅游大理、丽江的美景🏔️，一边轻松赚取收益，一起玩、一起赚，实现共赢！🎉</view>
        </view>

        <view class="doc-footer">（注：文档部分内容可能由AI生成）</view>
      </view>

      <!-- Tab 1: 产品详情 -->
      <view v-if="activeTab === 1" class="help-section">
        <!-- 标题区 -->
        <view class="section-header">
          <text class="section-icon">🏔️</text>
          <text class="section-title">云南6天5晚轻奢游</text>
        </view>

        <!-- 价格卡 -->
        <view class="price-card" v-if="productPrice.current > 0">
          <view class="price-tag">限时特惠</view>
          <view class="price-row">
            <text class="price-original" v-if="productPrice.original > productPrice.current">¥{{ productPrice.original }}</text>
            <text class="price-current">¥{{ productPrice.current }}</text>
            <text class="price-unit">/人</text>
          </view>
          <text class="price-note">6天5晚 · 精品小团 · 含全部交通</text>
        </view>

        <!-- 亮点标签 -->
        <view class="highlights-row">
          <view class="highlight-tag" v-for="h in highlights" :key="h.text">
            <text class="highlight-icon">{{ h.icon }}</text>
            <text class="highlight-text">{{ h.text }}</text>
          </view>
        </view>

        <!-- 费用说明 -->
        <view class="fee-section">
          <view class="fee-title">📋 费用包含</view>
          <view class="fee-items">
            <text class="fee-item" v-for="item in feeInclude" :key="item">✅ {{ item }}</text>
          </view>
          <view class="fee-title" style="margin-top:16rpx">📋 费用不含</view>
          <view class="fee-items">
            <text class="fee-item danger" v-for="item in feeExclude" :key="item">❌ {{ item }}</text>
          </view>
        </view>

        <!-- 每日行程 -->
        <view class="daily-title">📅 每日行程</view>
        <view class="trip-timeline">
          <view class="timeline-item" v-for="(item, index) in tripInfo" :key="index">
            <view class="timeline-dot"></view>
            <view class="timeline-content">
              <view class="day-header">
                <text class="day-title">{{ item.title }}</text>
                <view class="day-meals" v-if="item.meals">
                  <text class="meal-tag" v-if="item.meals.includes('早餐')">🍳 早</text>
                  <text class="meal-tag" v-if="item.meals.includes('午餐')">🥘 午</text>
                  <text class="meal-tag" v-if="item.meals.includes('晚餐')">🍜 晚</text>
                </view>
              </view>
              <text class="day-desc">{{ item.desc }}</text>
              <view class="day-tags" v-if="item.tags">
                <text class="day-tag" v-for="tag in item.tags" :key="tag">{{ tag }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 注意事项 -->
        <view class="notice-section">
          <view class="notice-title">⚠️ 出行须知</view>
          <text class="notice-item" v-for="item in notices" :key="item">{{ item }}</text>
        </view>
      </view>

      <!-- Tab 2: 产品花絮 -->
      <view v-if="activeTab === 2" class="help-section">
        <view class="section-header">
          <text class="section-icon">📸</text>
          <text class="section-title">精彩瞬间</text>
        </view>

        <!-- 出行花絮瀑布流 -->
        <view class="review-masonry" v-if="reviews.length > 0">
          <!-- 左列 -->
          <view class="review-col">
            <view class="review-card" v-for="(r, i) in leftCol" :key="r.id || r.nickname + i">
              <image class="review-card-img" :src="fullUrl(r.image)" mode="widthFix" />
              <view class="review-card-body">
                <view class="review-card-header">
                  <image class="review-card-avatar" :src="r.avatar" mode="aspectFill" />
                  <view class="review-card-info">
                    <text class="review-card-nick">{{ r.nickname }}</text>
                    <text class="review-card-stars">{{ '★'.repeat(r.rating || 5) }}{{ '☆'.repeat(5 - (r.rating || 5)) }}</text>
                  </view>
                </view>
                <text class="review-card-content">{{ r.content }}</text>
              </view>
            </view>
          </view>
          <!-- 右列 -->
          <view class="review-col">
            <view class="review-card" v-for="(r, i) in rightCol" :key="r.id || r.nickname + i + '_r'">
              <image class="review-card-img" :src="fullUrl(r.image)" mode="widthFix" />
              <view class="review-card-body">
                <view class="review-card-header">
                  <image class="review-card-avatar" :src="r.avatar" mode="aspectFill" />
                  <view class="review-card-info">
                    <text class="review-card-nick">{{ r.nickname }}</text>
                    <text class="review-card-stars">{{ '★'.repeat(r.rating || 5) }}{{ '☆'.repeat(5 - (r.rating || 5)) }}</text>
                  </view>
                </view>
                <text class="review-card-content">{{ r.content }}</text>
              </view>
            </view>
          </view>
        </view>
        <view v-else class="review-empty">
          <text>暂无花絮评价</text>
        </view>
      </view>
    </scroll-view>

    <!-- 底部Tab -->
    <view class="bottom-tabs">
      <view class="tab-item" :class="{ active: activeTab === 0 }" @click="activeTab = 0">
        <view class="tab-icon-wrap"><text class="tab-icon">📖</text></view>
        <text class="tab-text">分销机制</text>
      </view>
      <view class="tab-item" :class="{ active: activeTab === 1 }" @click="activeTab = 1">
        <view class="tab-icon-wrap"><text class="tab-icon">🏔️</text></view>
        <text class="tab-text">行程简介</text>
      </view>
      <view class="tab-item" :class="{ active: activeTab === 2 }" @click="activeTab = 2">
        <view class="tab-icon-wrap"><text class="tab-icon">📸</text></view>
        <text class="tab-text">出行花絮</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getRecommendProducts } from '../../api/product'
import { getReviewList } from '../../api/review'
import { BASE_URL } from '../../utils/request'

// 完整URL
function fullUrl(path: string) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return BASE_URL + path
}

const activeTab = ref(0)
const loading = ref(false)

// ============ Tab 1: 产品详情数据 ============
const tripInfo = ref<Array<{title: string; desc: string; meals: string; tags: string[]}>>([])
const highlights = ref<Array<{icon: string; text: string}>>([])
const notices = ref<string[]>([])
const feeInclude = ref<string[]>([])
const feeExclude = ref<string[]>([])
const productPrice = ref({ current: 0, original: 0 })

async function loadProductDetail() {
  loading.value = true
  try {
    const res = await getRecommendProducts({ limit: 1 })
    if (res.data && res.data.length > 0) {
      const p = res.data[0]
      productPrice.value = { current: p.promotionPrice || p.price, original: p.originalPrice || p.price }

      // 优先从行程库读取（如果产品关联了独立行程）
      if (p.itineraryId) {
        try {
          const itRes = await new Promise((resolve, reject) => {
            uni.request({
              url: getApp().globalData.baseUrl + '/api/itinerary/detail',
              data: { itineraryId: p.itineraryId },
              success: (res: any) => resolve(res.data),
              fail: reject
            })
          })
          if (itRes.code === 200 && itRes.data) {
            const it = itRes.data
            tripInfo.value = (it.days || []).map((d: any) => ({
              title: d.title || '',
              desc: d.description || '',
              meals: d.meals || '',
              tags: d.tags ? (typeof d.tags === 'string' ? d.tags.split(',').map((t: string) => t.trim()) : d.tags) : [],
            }))
            highlights.value = (it.highlights || []).map((h: any) => ({
              icon: h.icon || '✨',
              text: h.text || '',
            }))
            feeInclude.value = it.feeInclude || []
            feeExclude.value = it.feeExclude || []
            notices.value = it.notices || []
            loading.value = false
            return
          }
        } catch (itErr) {
          console.error('从行程库加载失败， fallback到产品内嵌数据', itErr)
        }
      }

      // Fallback: 使用产品内嵌行程数据
      tripInfo.value = (p.itinerary || []).map((d: any) => ({
        title: d.title || '',
        desc: d.description || '',
        meals: d.meals || '',
        tags: d.tags ? (typeof d.tags === 'string' ? d.tags.split(',').map((t: string) => t.trim()) : d.tags) : [],
      }))
      highlights.value = (p.highlights || []).map((h: any) => ({
        icon: h.icon || '✨',
        text: h.text || '',
      }))
      feeInclude.value = p.feeInclude || []
      feeExclude.value = p.feeExclude || []
      notices.value = p.notices || []
    }
  } catch (e) {
    console.error('加载产品详情失败', e)
  } finally {
    loading.value = false
  }
}

// ============ Tab 2: 产品花絮数据 ============
const photoTab = ref(0)
const photoList = ref<Array<Array<{src: string; loc: string; scene: string}>>>([[], [], [], []])

async function loadGallery() {
  try {
    const res = await getGalleryByCategory()
    if (res.data) {
      photoList.value = [
        (res.data.scene || []).map((i: any) => ({ src: i.url, loc: i.location || '', scene: i.scene || '' })),
        (res.data.food || []).map((i: any) => ({ src: i.url, loc: i.location || '', scene: i.scene || '' })),
        (res.data.hotel || []).map((i: any) => ({ src: i.url, loc: i.location || '', scene: i.scene || '' })),
        (res.data.experience || []).map((i: any) => ({ src: i.url, loc: i.location || '', scene: i.scene || '' })),
      ]
    }
  } catch (e) {
    console.error('加载素材失败', e)
  }
}

// 预览图片（微信自动支持长按保存）
function previewImages(tab: number, index: number) {
  const photos = photoList.value[tab]
  if (!photos || !photos[index]) return
  uni.previewImage({
    current: fullUrl(photos[index].src),
    urls: photos.map((p: any) => fullUrl(p.src)),
  })
}

// Tab切换时加载数据
watch(activeTab, (tab) => {
  if (tab === 1 && tripInfo.value.length === 0) loadProductDetail()
  if (tab === 2 && reviews.value.length === 0) loadReviews()
})

// 页面显示时加载
onShow(() => {
  if (activeTab.value === 1) loadProductDetail()
  if (activeTab.value === 2 && reviews.value.length === 0) loadReviews()
})

// ============ Tab 2: 出行花絮评价数据 ============
const reviews = ref<Array<{id?: string; image: string; avatar: string; nickname: string; rating: number; content: string; show?: boolean}>>([])

// 瀑布流左右分列（交替排列，形成错位效果）
const leftCol = computed(() => reviews.value.filter((_, i) => i % 2 === 0))
const rightCol = computed(() => reviews.value.filter((_, i) => i % 2 === 1))

async function loadReviews() {
  try {
    const res = await getReviewList()
    if (res.data && res.data.length > 0) {
      reviews.value = res.data.filter((r: any) => r.show !== false)
    } else {
      reviews.value = []
    }
  } catch (e) {
    console.error('加载花絮评价失败', e)
    reviews.value = []
  }
}
</script>

<style scoped>
.container { display: flex; flex-direction: column; height: 100vh; background: #FFF8E7; }

/* Header */
.header {
  background: linear-gradient(135deg, #FF9B3D 0%, #FF6B00 100%);
  padding: 50rpx 30rpx 40rpx;
  border-radius: 0 0 50rpx 50rpx;
}
.page-title { font-size: 40rpx; font-weight: bold; color: #fff; }

/* Content */
.content { flex: 1; padding: 30rpx; padding-bottom: 160rpx; }

.help-section { background: #fff; border-radius: 24rpx; padding: 30rpx; box-shadow: 0 4rpx 20rpx rgba(255,107,0,0.10); }

.section-header { display: flex; align-items: center; gap: 16rpx; margin-bottom: 30rpx; padding-bottom: 24rpx; border-bottom: 2rpx solid #f0f0f0; }
.section-icon { font-size: 40rpx; }
.section-title { font-size: 34rpx; font-weight: bold; color: #333; }

/* 数字高亮类 */
.highlight-money { color: #e8344e; font-weight: bold; }
.highlight-pct { color: #ff6b00; font-weight: bold; }
.highlight-key { color: #FF6B00; font-weight: bold; }

/* 总结区块专用高亮（深色背景用） */
.summary-money { color: #ff8f9b; font-weight: bold; }
.summary-key { color: #ffd700; font-weight: bold; }

/* 文档通用文字 */
.doc-intro { font-size: 26rpx; color: #555; line-height: 1.9; margin-bottom: 30rpx; background: #fff; padding: 24rpx; border-radius: 16rpx; border-left: 8rpx solid #FF9B3D; }
.section-title-bar { font-size: 28rpx; font-weight: bold; color: #fff; background: linear-gradient(135deg, #FF9B3D, #FF6B00); padding: 18rpx 22rpx; border-radius: 12rpx; margin: 28rpx 0 18rpx; }
.body-text { font-size: 26rpx; color: #444; line-height: 1.85; margin-bottom: 16rpx; }
.intro-para { color: #666; font-style: italic; }
.doc-footer { font-size: 22rpx; color: #bbb; text-align: center; margin-top: 30rpx; font-style: italic; }

/* 机制大块 */
.mech-block { margin-bottom: 24rpx; background: #fff; border-radius: 20rpx; border: 1rpx solid #FFE0B2; overflow: hidden; box-shadow: 0 4rpx 16rpx rgba(255,107,0,0.08); }
.mech-title { display: flex; align-items: center; gap: 12rpx; padding: 22rpx 26rpx; background: linear-gradient(135deg, #FF9B3D, #FF6B00); color: #fff; font-size: 30rpx; font-weight: bold; }
.mech-num { width: 44rpx; height: 44rpx; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.3); border-radius: 50%; font-size: 26rpx; }
.mech-key { font-size: 38rpx; color: #ffd700; }
.mech-advantage { padding: 18rpx 26rpx; background: #FFF3E0; font-size: 26rpx; color: #FF6B00; font-weight: bold; border-bottom: 1rpx solid #FFE0B2; }
.mech-content { padding: 22rpx 26rpx; }
.mech-sub { display: flex; flex-direction: column; margin-bottom: 16rpx; }
.sub-title { font-size: 27rpx; font-weight: bold; color: #333; margin-bottom: 8rpx; }
.mech-sub > text { font-size: 25rpx; color: #555; line-height: 1.8; }

/* 案例框 */
.case-box { background: #FFF3E0; border: 1rpx solid #FFE0B2; border-radius: 12rpx; padding: 18rpx 22rpx; margin: 14rpx 0; }

.case-tag { display: inline-block; font-size: 22rpx; font-weight: bold; color: #fff; background: linear-gradient(135deg, #FF9B3D, #FF6B00); padding: 4rpx 14rpx; border-radius: 20rpx; margin-right: 10rpx; margin-bottom: 6rpx; }
.case-box text:not(.case-tag) { font-size: 25rpx; color: #444; line-height: 1.75; }

/* 警告框 */
.warning-box { background: linear-gradient(135deg, #fff8f0, #fff); border: 1rpx solid #ffd0a0; border-radius: 12rpx; padding: 18rpx 22rpx; margin-top: 14rpx; display: flex; align-items: flex-start; gap: 10rpx; }
.warning-tag { font-size: 22rpx; font-weight: bold; color: #fff; background: linear-gradient(135deg, #ff9500, #ff6b00); padding: 4rpx 14rpx; border-radius: 20rpx; white-space: nowrap; }
.warning-box > text { font-size: 25rpx; color: #555; line-height: 1.75; }

/* 分红列表 */
.bonus-list { display: flex; flex-direction: column; gap: 18rpx; margin-top: 8rpx; }
.bonus-item { display: flex; align-items: flex-start; gap: 14rpx; background: #fff; border-radius: 14rpx; border: 1rpx solid #FFE0B2; padding: 18rpx; }
.bonus-num { width: 38rpx; height: 38rpx; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #FF9B3D, #FF6B00); color: #fff; font-size: 24rpx; font-weight: bold; border-radius: 50%; flex-shrink: 0; margin-top: 4rpx; }
.bonus-content { flex: 1; }
.bonus-title { display: block; font-size: 28rpx; font-weight: bold; color: #333; margin-bottom: 8rpx; }
.bonus-desc { display: block; font-size: 25rpx; color: #555; line-height: 1.7; margin-bottom: 8rpx; }
.bonus-example { display: block; font-size: 24rpx; color: #777; line-height: 1.65; font-style: italic; }

/* 步骤列表 */
.step-list { display: flex; flex-direction: column; gap: 20rpx; margin-bottom: 20rpx; }
.step-item { display: flex; align-items: flex-start; gap: 16rpx; }
.step-num { width: 48rpx; height: 48rpx; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #FF9B3D, #FF6B00); color: #fff; font-size: 28rpx; font-weight: bold; border-radius: 50%; flex-shrink: 0; }
.step-body { flex: 1; }
.step-title { display: block; font-size: 28rpx; font-weight: bold; color: #333; margin-bottom: 8rpx; }
.step-desc { display: block; font-size: 25rpx; color: #555; line-height: 1.75; margin-bottom: 10rpx; }

/* 结算区块 */
.settlement-item { background: #fff; border-radius: 16rpx; border: 1rpx solid #FFE0B2; padding: 22rpx 26rpx; margin-bottom: 18rpx; }
.settlement-title { font-size: 28rpx; font-weight: bold; color: #333; margin-bottom: 10rpx; padding-bottom: 10rpx; border-bottom: 1rpx solid #FFE0B2; }
.settlement-desc { font-size: 25rpx; color: #555; line-height: 1.75; margin-bottom: 10rpx; }

/* Q&A */
.qa-section { display: flex; flex-direction: column; gap: 20rpx; }
.qa-item { background: #fff; border-radius: 16rpx; border: 1rpx solid #FFE0B2; padding: 22rpx 26rpx; }
.qa-q { font-size: 27rpx; font-weight: bold; color: #333; line-height: 1.6; margin-bottom: 12rpx; }
.qa-a { font-size: 25rpx; color: #555; line-height: 1.75; margin-bottom: 10rpx; }

/* 总结区块 */
.summary-block { background: linear-gradient(135deg, #FF9B3D 0%, #FF6B00 100%); border-radius: 20rpx; padding: 28rpx; margin-top: 24rpx; }
.summary-title { font-size: 30rpx; font-weight: bold; color: #fff; margin-bottom: 16rpx; }
.summary-text { font-size: 26rpx; color: rgba(255,255,255,0.92); line-height: 1.85; margin-bottom: 16rpx; }
.summary-cta { font-size: 27rpx; color: #ffd700; font-weight: bold; line-height: 1.7; text-align: center; }

/* 价格卡 */
.price-card { background: linear-gradient(135deg, #FF9B3D 0%, #FF6B00 100%); border-radius: 20rpx; padding: 24rpx 28rpx; margin-bottom: 20rpx; position: relative; overflow: hidden; }
.price-tag { display: inline-block; background: #ffd700; color: #333; font-size: 22rpx; font-weight: bold; padding: 4rpx 16rpx; border-radius: 20rpx; margin-bottom: 12rpx; }
.price-row { display: flex; align-items: baseline; gap: 10rpx; margin-bottom: 6rpx; }
.price-original { font-size: 28rpx; color: rgba(255,255,255,0.55); text-decoration: line-through; }
.price-current { font-size: 56rpx; font-weight: bold; color: #ffd700; }
.price-unit { font-size: 26rpx; color: rgba(255,255,255,0.8); }
.price-note { font-size: 24rpx; color: rgba(255,255,255,0.8); }

/* 亮点标签 */
.highlights-row { display: flex; flex-wrap: wrap; gap: 14rpx; margin-bottom: 20rpx; }
.highlight-tag { display: flex; align-items: center; gap: 8rpx; background: #fff; border: 1rpx solid #FFE0B2; border-radius: 20rpx; padding: 10rpx 18rpx; }
.highlight-icon { font-size: 26rpx; }
.highlight-text { font-size: 24rpx; color: #555; font-weight: 500; }

/* 费用说明 */
.fee-section { background: #fff; border-radius: 16rpx; border: 1rpx solid #FFE0B2; padding: 22rpx 26rpx; margin-bottom: 20rpx; }
.fee-title { font-size: 28rpx; font-weight: bold; color: #333; margin-bottom: 12rpx; }
.fee-items { display: flex; flex-direction: column; gap: 10rpx; }
.fee-item { font-size: 25rpx; color: #555; line-height: 1.6; }
.fee-item.danger { color: #e8344e; }

/* 每日行程标题 */
.daily-title { font-size: 30rpx; font-weight: bold; color: #333; margin-bottom: 20rpx; padding: 12rpx 0; border-bottom: 2rpx solid #e0e4ff; }

/* Day详情 */
.day-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6rpx; }
.day-title { font-size: 28rpx; font-weight: bold; color: #333; }
.day-meals { display: flex; gap: 8rpx; }
.meal-tag { font-size: 20rpx; background: #f0e6ff; color: #FF6B00; padding: 2rpx 10rpx; border-radius: 10rpx; }
.day-desc { font-size: 24rpx; color: #666; line-height: 1.7; margin-bottom: 8rpx; }
.day-tags { display: flex; flex-wrap: wrap; gap: 8rpx; }
.day-tag { font-size: 20rpx; background: #fff0f0; color: #e8344e; padding: 2rpx 10rpx; border-radius: 8rpx; }

/* 注意事项 */
.notice-section { background: linear-gradient(135deg, #fff9f0, #fff); border-radius: 16rpx; border: 1rpx solid #ffe0b2; padding: 22rpx 26rpx; margin-top: 20rpx; }
.notice-title { font-size: 28rpx; font-weight: bold; color: #333; margin-bottom: 14rpx; }
.notice-item { display: block; font-size: 24rpx; color: #666; line-height: 1.8; margin-bottom: 8rpx; }

/* 相册分类 */
.gallery-tabs { display: flex; gap: 12rpx; margin-bottom: 20rpx; overflow-x: auto; padding-bottom: 4rpx; }
.gallery-tab { flex-shrink: 0; padding: 10rpx 20rpx; border-radius: 20rpx; font-size: 24rpx; color: #666; background: #f0f0f5; }
.gallery-tab.active { background: linear-gradient(135deg, #FF9B3D, #FF6B00); color: #fff; font-weight: bold; }

/* 相册项 */
.gallery-item { position: relative; border-radius: 12rpx; overflow: hidden; }
.gallery-caption { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.7)); padding: 20rpx 12rpx 10rpx; }
.gallery-loc { display: block; font-size: 22rpx; color: #ffd700; font-weight: bold; margin-bottom: 2rpx; }
.gallery-scene { display: block; font-size: 20rpx; color: rgba(255,255,255,0.9); }

/* 评价 */
.review-section { margin-top: 24rpx; }
.review-title { font-size: 30rpx; font-weight: bold; color: #333; margin-bottom: 16rpx; }
.review-item { background: #fff; border-radius: 16rpx; padding: 20rpx 22rpx; margin-bottom: 16rpx; }
.review-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10rpx; }
.review-name { font-size: 26rpx; font-weight: bold; color: #333; }
.review-stars { display: flex; gap: 2rpx; }
.star { font-size: 22rpx; }
.review-text { font-size: 24rpx; color: #666; line-height: 1.75; }

/* 时间线 */
.trip-timeline { display: flex; flex-direction: column; }
.timeline-item { display: flex; padding-bottom: 30rpx; position: relative; }
.timeline-item:not(:last-child)::after { content: ''; position: absolute; left: 16rpx; top: 36rpx; bottom: 0; width: 2rpx; background: #e0e0e0; }
.timeline-dot { width: 32rpx; height: 32rpx; background: linear-gradient(135deg, #FF9B3D, #FF6B00); border-radius: 50%; margin-right: 24rpx; flex-shrink: 0; margin-top: 4rpx; }
.timeline-content { flex: 1; }
.timeline-title { display: block; font-size: 28rpx; font-weight: bold; color: #333; margin-bottom: 6rpx; }
.timeline-desc { font-size: 24rpx; color: #888; }

/* 图库 */
.gallery-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12rpx; }
.gallery-img { width: 100%; height: 180rpx; border-radius: 12rpx; background: #eee; }

/* 出行花絮瀑布流 */
.review-masonry { display: flex; gap: 16rpx; align-items: flex-start; margin-top: 10rpx; }
.review-col { flex: 1; display: flex; flex-direction: column; gap: 16rpx; }
/* 右列整体往上偏移半个卡片，产生错位美感 */
.review-col:last-child { margin-top: 80rpx; }
.review-card { break-inside: avoid; margin-bottom: 16rpx; background: #fff; border-radius: 16rpx; overflow: hidden; box-shadow: 0 2rpx 12rpx rgba(255,107,0,0.08); }
.review-card-img { width: 100%; display: block; background: #f5f5f5; }
.review-card-body { padding: 16rpx; }
.review-card-header { display: flex; align-items: center; gap: 10rpx; margin-bottom: 10rpx; }
.review-card-avatar { width: 44rpx; height: 44rpx; border-radius: 50%; flex-shrink: 0; object-fit: cover; background: #eee; }
.review-card-info { display: flex; flex-direction: column; min-width: 0; }
.review-card-nick { font-size: 24rpx; font-weight: 600; color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.review-card-stars { font-size: 20rpx; color: #FFB800; letter-spacing: 1rpx; }
.review-card-content { font-size: 24rpx; color: #555; line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.review-empty { text-align: center; padding: 60rpx 0; color: #bbb; font-size: 26rpx; }

/* 底部Tab */
.bottom-tabs {
  position: fixed; bottom: 0; left: 0; right: 0; display: flex; align-items: center;
  justify-content: center; gap: 20rpx;
  background: #FFF8E7; padding: 16rpx 24rpx; padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid #FFE0B2;
}
.tab-item {
  flex: 1; height: 80rpx; display: flex; align-items: center; justify-content: center; gap: 8rpx;
  border-radius: 40rpx; background: #FFEEDD; transition: all 0.2s;
}
.tab-item.active {
  background: linear-gradient(135deg, #FF9B3D, #FF6B00); box-shadow: 0 4rpx 16rpx rgba(255,107,0,0.35);
}
.tab-item + .tab-item::before { display: none; }
.tab-icon-wrap { display: flex; align-items: center; justify-content: center; }
.tab-icon { font-size: 30rpx; opacity: 0.55; }
.tab-item.active .tab-icon { opacity: 1; }
.tab-text { font-size: 26rpx; color: #999; font-weight: normal; }
.tab-item.active .tab-text { color: #fff; font-weight: bold; }
.tab-item.active .tab-icon-wrap { background: transparent; padding: 0; }
.tab-item.active::after { display: none; }
/* 分隔线只在非激活项上显示 */
</style>
