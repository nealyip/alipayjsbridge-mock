/// <reference types="typings-alipayjsbridge" />
declare var queryString: any;

export default function f(w: Window, startupParams: string = '{}', sandbox: boolean = false) {
    type StringOrZero = string | 0;

    function transparentBox(id, defaultText = '...', position?: { top?: StringOrZero, right?: StringOrZero, left?: StringOrZero, bottom?: StringOrZero }): HTMLDivElement {
        const d = document.createElement('div');
        document.body.appendChild(d);
        d.id = id;
        d.innerText = defaultText;
        d.style.position = 'fixed';
        ['top', 'right', 'left', 'bottom']
            .forEach(v => {
                if (position && (position[v] || position[v] === 0)) {
                    d.style[v] = position[v];
                }
            });
        d.style.minWidth = '100px';
        d.style.height = '100px';
        d.style.backgroundColor = 'rgba(0,0,0,.7)';
        d.style.zIndex = '9999999999';
        d.style.color = '#fff';
        d.style.fontSize = '20px';
        d.style.textAlign = 'center';
        d.style.lineHeight = '100px';
        d.style.paddingLeft = '20px';
        d.style.paddingRight = '20px';
        return d;
    }

    function removeTransparentBox(id): void {
        const m = document.getElementById(id);
        if (m) {
            document.body.removeChild(m);
        }
    }

    class Funs {
        static showToolbar(): void {
        }

        static setTitle(params: Ali.Funcs.setTitle): void {
            document.title = params.title + (params.subtitle ? ` (${params.subtitle})` : '');
        }

        static showOptionMenu(): void {
            const m = document.getElementById('___optionmenu');
            if (!m) {
                var d = transparentBox('___optionmenu', '', {right: 0, top: 0});
                d.addEventListener('click', () => {
                    const event = new Event('optionMenu');
                    document.dispatchEvent(event);
                })
            }
        }

        static setOptionMenu(params: Ali.Funcs.optionMenu): void {
            const m = document.getElementById('___optionmenu');
            m.innerText = params.title;
            // const s = document.createElement('style');
            // document.body.appendChild(s);
            // s.id = '__optionmenu_style';
            // s.innerText = `#___optionmenu{left : 0;right:initial !important;}`;
        }

        static hideOptionMenu(): void {
            removeTransparentBox('___optionmenu');
        }

        static showLoading(params: Ali.Funcs.showLoading): void {
            const f = () => {
                const div = transparentBox('___loading', params.text || 'Loading...', {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                });
                div.style.margin = 'auto';
                div.style.width = div.style.height = div.style.lineHeight = '150px';
            };
            if (isNaN(params.delay)) {
                setTimeout(f, params.delay);
            } else {
                f();
            }
        }

        static hideLoading(): void {
            removeTransparentBox('___loading');
        }

        static pushWindow(params: Ali.Funcs.pushWindow): void {
            window.location.href = params.url;
            // window.confirm(`You are going to ${params.url}`) ? window.location.href = params.url : void 0;
        }

        static alert(params: Ali.Funcs.alert): void {
            window.alert(params.message);
        }

        static openInBrowser(params: Ali.Funcs.openInBrowser): void {
            window.confirm(`You are going to ${params.url} by openInBrowser`) ? window.open(params.url) : void 0;
        }

        static toast(params: Ali.Funcs.toast, success?: () => void): void {
            transparentBox('___toast', params.content, {
                bottom: 0,
                left: 0,
                right: 0
            });
            if (typeof params.duration === 'number') {
                setTimeout(() => {
                    removeTransparentBox('___toast');
                }, params.duration);
            }
        }

        static popTo(params: Ali.Funcs.popTo) {
            if (params.url) {
                window.location.href = params.url;
            } else if (params.data.url) {
                window.location.href = params.data.url;
            }
        }

        static tradePay(params: Ali.Funcs.tradePay, success?: (result: Ali.tradePayResult) => void): void {
            let domain = 'openapi.alipaydev.com';
            if (!sandbox) {
                domain = 'mapi-hk.alipay.com';
            }
            window.open(`https://${domain}/gateway.do?${params.orderStr}`);
        }
    }

    try {
        startupParams = JSON.parse(startupParams && decodeURIComponent(startupParams) || '{}');
    } catch (e) {
        alert('Decoding JSON startup params was fail, ' + e.message);
    }

    const MockAlipayJSBridge: Ali.AlipayJSBridge = <Ali.AlipayJSBridge> {
        startupParams
    };

    MockAlipayJSBridge.call = (name: any, params?: any, success?: (result: any) => void): void => {
        if (typeof Funs[name] === "function") {
            console.debug(`${name} is called`, params);
            Funs[name](params, success);
        } else {
            console.warn('This function is not implemented ' + name);
        }
    };


    function bindAlipayJSBridgeEvent() {
        // w.addEventListener('load', function () {
        const event = new Event('AlipayJSBridgeReady');
        document.dispatchEvent(event);
        // });
    }

    if (typeof w.AlipayJSBridge === 'undefined') {
        Funs.toast({
            content: 'Using Mock AlipayJSBridge',
            duration: 1000
        });
        w.AlipayJSBridge = MockAlipayJSBridge;
        bindAlipayJSBridgeEvent();
    }
}