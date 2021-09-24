var InsticatorSession=(()=>{
    const cookieName = 'InsticatorSession'

    class Session {
        #id
        #expiration
        #referrer
        #campaign
        constructor(opts={}){
            this.#id = opts.id || null
            this.#expiration = new Date( opts.expiration || Session.nextExpiration )
            this.#referrer = opts.referrer || document.referrer
            this.#campaign = opts.campaign || Session.currentCampaign
            //this.#userActions = opts.userActions || []

            CookieManager.set(cookieName, this, this.expiration)
        }

        static getSession(){
            const cookie = CookieManager.get(cookieName)
            let session
            
            if(cookie){
                session = new this( cookie )

                if(session.campaign !== this.currentCampaign){
                    session.expire()
                    session = null
                } else {
                    session.extend()
                }
            }

            if( !session ) {
                session = new this()
            }
            
            //console.log( CookieManager.get(cookieName) )
            return session
        }

        get id(){
            if( !this.#id )
                this.#id = 'awd34!@a754' //replace with call to server for unique id
            return this.#id
        }
        get expiration(){ return this.#expiration }
        get referrer(){ return this.#referrer }
        get campaign(){ return this.#campaign }

        extend(){
            CookieManager.set( cookieName, this, Session.nextExpiration )
        }

        expire(){
            CookieManager.remove( cookieName )
        }

        toString(){
            return
        }

        static get currentCampaign(){
            const paramName = 'campaign'
            const matches = /([^&#=]*)=([^&#=]*)/g.execAll(window.location.search)

            for(let match of matches){
                if(match[1] === paramName)
                    return match[2]
            }

            return null
        }
        static get nextExpiration(){
            const getIntervalExpiration = (date=new Date()) => new Date(date).setTime(date.getTime() + 1800000) //30 min later
            const getEndOfDay = ( date=new Date() ) => {
                const today = new Date( date.toDateString() )
                today.setDate( date.getDate()+1 )
                return new Date( today.setTime(today.getTime()-1) )
            }

            return new Date( Math.min(getIntervalExpiration(), getEndOfDay()) )
        }
    }

    class CookieManager {
        static get default(){
            return {
                expires: null,
                domain: null, //window.location.href,
                path: '/',
                secure: false
            }
        }

        static get(name) {
            //console.log('Get Cookie: ',name)
            const cookieName = `${encodeURIComponent(name)}=`;
            const cookies = document.cookie;
            const startIndex = cookies.indexOf(cookieName);
            let value = null;

            if (startIndex > -1) {
                let str = ''
                let endIndex = cookies.indexOf(';', startIndex);
                
                if (endIndex == -1) {
                    endIndex = cookies.length;
                }
                str = cookies.substring(startIndex + name.length, endIndex)
                value = decodeURIComponent( str.substr( str.charAt(0)=='='?1:0 ) );
                if( isJSON(value) ){
                    value = JSON.parse(value)
                }
            }

            return value;
        }

        static set(name,
                value,
                expires=this.default.expires,
                domain=this.default.domain,
                path=this.default.path,
                secure=this.default.secure)
        {
            //console.log(`Set Cookie '${name}':`,value)
            //console.log( value instanceof Object, JSON.stringify(value))
            let cookieText = `${encodeURIComponent(name)}=${encodeURIComponent( value instanceof Object ? JSON.stringify(value) : value )}`;

            if (expires instanceof Date) {
                cookieText += `; expires=${expires.toGMTString()}`;
            }

            if (path) cookieText += `; path=${path}`;
            if (domain) cookieText += `; domain=${domain}`;
            if (secure) cookieText += `; secure`;
            
            //console.log('Setting cookie: ',cookieText)
            document.cookie = cookieText;
        }

        static remove(name,
                    domain=this.default.domain,
                    path=this.default.path,
                    secure=this.default.secure)
        {
            CookieManager.set(name, "", new Date(0), domain, path, secure);
        }
    }

    function isJSON(val){
        if( typeof val !== 'String')
            return false
        try {
            JSON.parse(val)
            return true
        } catch(e){
            return false
        }
    }

    return Session
})()