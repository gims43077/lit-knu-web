"""Run against a local Vite server with Python Playwright and Chromium installed.
LIT_TEST_URL defaults to http://127.0.0.1:5173. Uses isolated browser storage.
"""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

URL = os.environ.get('LIT_TEST_URL', 'http://127.0.0.1:5173')
OUT = Path('/tmp/lit-browser-checks')
OUT.mkdir(exist_ok=True)

def ready(page):
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(3000)
    page.wait_for_function("document.body.style.position !== 'fixed'")

def open_popup(page, button):
    button.scroll_into_view_if_needed()
    page.wait_for_timeout(500)
    button.evaluate("e=>e.addEventListener('click',()=>window.__beforePopup=scrollY,{once:true,capture:true})")
    button.click()
    before = page.evaluate('window.__beforePopup')
    expect(page.get_by_role('dialog')).to_be_visible()
    page.wait_for_timeout(400)
    assert page.evaluate('document.body.style.position') == 'fixed'
    locked_y = -float(page.evaluate('document.body.style.top').replace('px',''))
    assert abs(locked_y - before) < 2, f'open position: before={before}, locked={locked_y}'
    return before

def close_popup(page, before):
    page.locator('[data-modal-root] > div').first.click(position={'x':3,'y':3})
    expect(page.get_by_role('dialog')).to_have_count(0)
    page.wait_for_timeout(400)
    assert abs(page.evaluate('window.scrollY') - before) < 2, 'position not restored'
    page.mouse.move(5,200)
    page.mouse.wheel(0, -180 if before > 200 else 180)
    page.wait_for_timeout(700)
    assert abs(page.evaluate('window.scrollY') - before) > 10, 'page remains locked'

def gesture(page, mobile, delta):
    panel=page.locator('.modal-panel')
    box=panel.bounding_box()
    x=box['x']+10
    y=box['y']+min(box['height']-30,180)
    if mobile:
        cdp=page.context.new_cdp_session(page)
        cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x,'y':y}]})
        for i in range(1,9):
            cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':x,'y':y-delta*i/8}]})
            page.wait_for_timeout(20)
        cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
        cdp.detach()
    else:
        page.mouse.move(x,y)
        page.mouse.wheel(0,delta)
    page.wait_for_timeout(500)

def check_scroll(page,mobile,name):
    panel=page.locator('.modal-panel')
    saved=page.evaluate("({top:document.body.style.top,y:scrollY})")
    panel.evaluate('(e)=>e.scrollTop=0')
    extent=panel.evaluate('(e)=>e.scrollHeight-e.clientHeight')
    gesture(page,mobile,100)
    if extent > 1:
        assert panel.evaluate('(e)=>e.scrollTop') > 0, f'{name}: internal scroll failed'
    for bottom,delta in [(True,100),(False,-100)]:
        panel.evaluate('(e,b)=>e.scrollTop=b?e.scrollHeight:0',bottom)
        gesture(page,mobile,delta)
        assert page.evaluate("({top:document.body.style.top,y:scrollY})") == saved, f'{name}: background moved'
    if not mobile:
        # Small repeated wheel deltas exercise the trackpad-style event path.
        panel.evaluate('(e)=>e.scrollTop=0')
        box=panel.bounding_box();page.mouse.move(box['x']+10,box['y']+100)
        for _ in range(12): page.mouse.wheel(0,8)
        page.wait_for_timeout(300)
        if extent>1: assert panel.evaluate('(e)=>e.scrollTop')>0
    page.screenshot(path=str(OUT/f'{name}.png'))
    print(f'PASS {name}: scroll, boundaries, background lock (overflow={extent})',flush=True)

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    for mobile in ([] if os.environ.get('LIT_TEST_COMPACT_ONLY') else [False,True]):
        mode='mobile' if mobile else 'desktop'
        context=browser.new_context(viewport={'width':390 if mobile else 1280,'height':640 if mobile else 720},is_mobile=mobile,has_touch=mobile,device_scale_factor=1)
        page=context.new_page();errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.goto(URL);ready(page)
        assert page.get_by_title('공지사항 수정',exact=True).count()==0
        before=open_popup(page,page.get_by_role('button',name='부원 로그인하기',exact=True))
        check_scroll(page,mobile,mode+'-login')
        page.get_by_role('button',name='신규 부원 가입',exact=True).click()
        check_scroll(page,mobile,mode+'-register')
        close_popup(page,before)
        before=open_popup(page,page.get_by_role('button',name='부원 로그인하기',exact=True))
        page.get_by_placeholder('예: LIT, shlee, minji_kim').fill('LIT')
        page.get_by_placeholder('비밀번호를 입력하세요',exact=True).fill('1234')
        page.get_by_role('button',name='계정 로그인',exact=True).click()
        expect(page.get_by_role('dialog')).to_have_count(0,timeout=5000)
        original=page.evaluate("JSON.parse(localStorage.getItem('lit_msa_missions_v1'))[0]")
        before=open_popup(page,page.get_by_title('공지사항 수정',exact=True).first)
        expect(page.locator('.modal-panel input[type=text]').first).to_have_value(page.locator('#missions h3').first.inner_text())
        expect(page.locator('.modal-panel textarea')).to_have_value(original['desc'])
        check_scroll(page,mobile,mode+'-notice-edit')
        page.locator('.modal-panel input[type=text]').first.fill('취소할 내용')
        page.get_by_role('button',name='취소',exact=True).click()
        expect(page.get_by_role('dialog')).to_have_count(0)
        assert page.evaluate("JSON.parse(localStorage.getItem('lit_msa_missions_v1'))[0]")==original
        open_popup(page,page.get_by_title('공지사항 수정',exact=True).first)
        title='수정 저장 확인 '+mode
        desc='수정한 상세 내용\n두 번째 줄'
        page.locator('.modal-panel input[type=text]').first.fill(title)
        page.locator('.modal-panel textarea').fill(desc)
        page.get_by_role('button',name='변경 내용 저장',exact=True).click()
        expect(page.get_by_role('dialog')).to_have_count(0)
        expect(page.locator('#missions h3').first).to_have_text(title)
        expect(page.locator('#missions').get_by_text(desc,exact=True)).to_be_visible()
        updated=page.evaluate("JSON.parse(localStorage.getItem('lit_msa_missions_v1'))[0]")
        for key in ['id','completedMemberHandles','category','active']: assert updated.get(key)==original.get(key), (key, original.get(key), updated.get(key))
        page.reload();ready(page)
        expect(page.locator('#missions h3').first).to_have_text(title)
        open_popup(page,page.get_by_title('공지사항 수정',exact=True).first)
        expect(page.locator('.modal-panel textarea')).to_have_value(desc)
        page.get_by_role('button',name='취소',exact=True).click()
        expect(page.get_by_role('dialog')).to_have_count(0)
        print('PASS '+mode+': notice prefill, cancel, save, card details, reload, metadata',flush=True)
        for label,button in [
            ('profile',page.get_by_role('button',name='프로필 수정',exact=True)),
            ('notice-create',page.get_by_role('button',name='새 공지 등록하기',exact=True)),
            ('faq',page.get_by_title('FAQ 수정',exact=True).first),
            ('article',page.get_by_role('button',name='새 글 공유하기',exact=True)),
        ]:
            before=open_popup(page,button)
            check_scroll(page,mobile,mode+'-'+label)
            close_popup(page,before)
        # Check lost authorization both in an open editor and at the service boundary.
        open_popup(page,page.get_by_title('공지사항 수정',exact=True).first)
        page.evaluate("async()=>{const {storageService:s}=await import('/src/services/storageService.js');s.setCurrentUser('shlee');s.setAdmin(false)}")
        page.get_by_role('button',name='변경 내용 저장',exact=True).click()
        expect(page.get_by_role('alert')).to_contain_text('권한')
        page.get_by_role('button',name='취소',exact=True).click()
        expect(page.get_by_role('dialog')).to_have_count(0)
        assert page.get_by_title('공지사항 수정',exact=True).count()==0
        denied=page.evaluate("async()=>{const {storageService:s}=await import('/src/services/storageService.js');try{s.updateMission(s.getMissions()[0].id,{title:'forbidden'});return false}catch{return true}}")
        assert denied
        expect(page.locator('#missions h3').first).to_have_text(title)
        assert page.locator('footer').get_by_text('LIT',exact=True).count()>0
        assert not errors,errors
        print('PASS '+mode+': authorization, footer, no runtime errors',flush=True)
        context.close()
    context=browser.new_context(viewport={'width':390,'height':400},is_mobile=True,has_touch=True,reduced_motion='reduce')
    page=context.new_page()
    page.goto(URL);ready(page)
    page.evaluate("async()=>{const {storageService:s}=await import('/src/services/storageService.js');s.loginMember('LIT','1234')}")
    before=open_popup(page,page.get_by_title('공지사항 수정',exact=True).first)
    assert page.locator('.modal-panel').evaluate('(e)=>e.scrollHeight>e.clientHeight')
    check_scroll(page,True,'mobile-compact-reduced-motion-notice')
    close_popup(page,before)
    print('PASS compact mobile: overflowing notice, reduced motion, touch, position restoration',flush=True)
    context.close()
    browser.close()
