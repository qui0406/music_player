const $= document.querySelector.bind(document);
const $$= document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY= 'F8_PLAYER';

const cd= $('.cd');

const heading= $('header h2');
const cdThumb= $('.cd-thumb');
const audio= $('#audio');

const playBtn= $('.btn-toggle-play');
const player= $('.player'); 

const progress= $('#progress');
const bntNext= $('.btn-next');
const btnPrev= $('.btn-prev');
const randomBtn= $('.btn-random');
const reapeatBtn= $('.btn-repeat');

const playlist= $('.playlist');


const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isReapeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Cẩm tú cầu',
            singer: 'RayO, Huỳnh Văn',
            path:  './assets/music/CamTuCau.mp3',
            image: './assets/imgs/camtucau.jpg'
        },
        {
            name: 'Anh cần thời gian để trái tim lành lại',
            singer: 'Nguyễn Trần Trung Quân',
            path:   './assets/music/AnhCanThoiGianDeTraiTimMauLanhLai-NguyenTranTrungQuan-6288589.mp3',
            image: './assets/imgs/anhcanthoigiandetraitimlanhla.jpg'
        },
        {
            name: 'Cánh hoa héo tàn',
            singer: 'Khánh Phương',
            path:   './assets/music/CanhHoaHeoTanDominoRemix-KhanhPhuong-15999917.mp3',
            image: './assets/imgs/canhhoaheotan.jpg'
        },
        {
            name: 'Vừa hận vừa yêu',
            singer: 'Trung Tự',
            path:   './assets/music/VuaHanVuaYeuTrapRnBVerGoldenMonkeyRemix-TrungTu-15370790.mp3',
            image: './assets/imgs/vuahanvuayeu.jpg'
        },
    ],
    setconfig: function(key, value){
        this.config[key]= value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config)); 
    },

    defineProperties: function(){
        Object.defineProperty(this, 'currentSong', {
            get: function(){
                return this.songs[this.currentIndex];
            }
        })
    },

    render: function(){
        const htmls= this.songs.map((song, index)=>{
            return `
                <div class="song ${index===this.currentIndex ? 'active': ''}" data-index="${index}">
                    <div class="thumb" style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
        })
        playlist.innerHTML= htmls.join('');
    },

    handleEvents: function(){
        const _this= this;
        const cdWidth= cd.offsetWidth;

        //Xu ly CD quay / dung
        const cdThumbAnimate= cdThumb.animate([
            {transform:'rotate(360deg)'}
        ], {
            duration: 10000,
            iterations: Infinity
        })
        cdThumbAnimate.pause();

        //Xu ly phong to thu nho
        document.onscroll= function(){
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;

            cd.style.width= newCdWidth >0 ? newCdWidth + 'px' : 0;
            cd.style.opacity= newCdWidth / cdWidth
        }

        //Xu ly khi click play
        playBtn.onclick= function(){
            if(_this.isPlaying){
                audio.pause();
            }else{
                audio.play();
            }
        }

        //Khi song duoc play
        audio.onplay= function(){
            _this.isPlaying= true;
            player.classList.add('playing');
            cdThumbAnimate.play();
        }

        //Khi song bi pause
        audio.onpause= function(){
            _this.isPlaying= false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        }

        //Khi tien do bai hat thay doi
        audio.ontimeupdate= function(){
            if(audio.duration){
                const progressPercent= Math.floor(audio.currentTime / audio.duration * 100);
                progress.value= progressPercent;
            }
        }

        //Xu ly khi tua song
        progress.onchange= function(e){
            const seekTime= audio.duration / 100 * e.target.value;
            audio.currentTime= seekTime;
        }

        //Khi next song
        bntNext.onclick= function(){
            if(_this.isRandom){
                _this.playRandomSong();
            }else{
                _this.nextSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        //Khi prev song
        btnPrev.onclick= function(){
            if(_this.isRandom){
                _this.playRandomSong();
            }else{
                _this.prevSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();

        }

        //Random song
        randomBtn.onclick= function(){
             _this.isRandom= !_this.isRandom;
             _this.setconfig('isRandom', _this.isRandom);
            randomBtn.classList.toggle('active', _this.isRandom);
        }

        // Repeat song
        reapeatBtn.onclick=function(){
            _this.isReapeat= !_this.isReapeat;
            _this.setconfig('isReapeat', _this.isReapeat);
            reapeatBtn.classList.toggle('active', _this.isReapeat);
        }

        //Xu ly next song khi audio ended
        audio.onended= function(){
            if(_this.isReapeat){
                audio.play();
            }else{
                bntNext.click();
            }
        }

        //Lang nghe click vao playlist
        playlist.onclick= function(e){
            const songNode= e.target.closest('.song:not(.active)');
            if(songNode || e.target.closest('.option')){
            //xu ly khi click vao song
               if(songNode){
                    _this.currentIndex=Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    _this.render();
                    audio.play();
               }

               //Xu ly khi click vao song option
                if(e.target.closest('.option')){
                     console.log('click vao option');
                }
            }
        }


    },

    loadCurrentSong: function(){
        heading.textContent= this.currentSong.name;
        cdThumb.style.backgroundImage= `url('${this.currentSong.image}')`;
        audio.src= this.currentSong.path;
    },

    loadConfig: function(){
        this.isRandom= this.config.isRandom;
        this.isReapeat= this.config.isReapeat;

       // Object.assign(this, this.config);
    },

    nextSong: function(){
        this.currentIndex++;
        if(this.currentIndex >= this.songs.length){
            this.currentIndex= 0;
        }
        this.loadCurrentSong();
    },

    prevSong: function(){
        this.currentIndex--;
        if(this.currentIndex < 0){
            this.currentIndex= this.songs.length - 1;
        }
    },

    playRandomSong: function(){
        let newIndex;
        do {
            newIndex=Math.floor(Math.random() * this.songs.length);
        } while (newIndex === this.currentIndex);

        this.currentIndex= newIndex;
        this.loadCurrentSong();
    },

    scrollToActiveSong: function(){
        $('.song.active').scrollIntoView({
            behavior: 'smooth',
            block: 'center',
        })
    },


    start: function(){
        //Gan cau hinh tu config vao ung dung
        this.loadConfig();

        //Dinh nghia cac thuoc tinh cho object
        this.defineProperties();

        //Lang nghe xu ly cac su kien
        this.handleEvents();

        //Tai thong tin bai hat dau tien vao UI khi chay ung dung
        this.loadCurrentSong();

        //Render playlist
        this.render();

        //Hien thi trang thai ban dau cua button repeat va random
        reapeatBtn.classList.toggle('active', this.isReapeat);
        randomBtn.classList.toggle('active', this.isRandom);
        
    },
}

app.start();