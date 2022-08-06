const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY= 'Hoangdai_Player';

const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const cd = $('.cd');
const playBtn = $('.btn-toggle-play');
const player = $('.player');
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playList = $('.playlist')

const app = {
    currentIndex : 0,
    isPlaying : false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: "Một bước yêu vạn dặm đau",
            singer: "Mr.Siro",
            path : "./assets/music/Motbuocyeuvandamdau.mp3",
            // path: "https://data3.chiasenhac.com/downloads/2113/3/2112378-3dd4c93a/128/Mot%20Buoc%20Yeu%20Van%20Dam%20Dau%20-%20Mr%20Siro.mp3",
            image: "https://photo-resize-zmp3.zadn.vn/w240_r1x1_jpeg/cover/2/3/d/3/23d3bfa1656027dcf914d9c3bae263eb.jpg"
        },
        {
            name: "Tự lau nước mắt",
            singer: "Mr.Siro",
            path: "./assets/music/Tulaunuocmat.mp3",
            image:
                "https://i.scdn.co/image/ab67616d0000b2735e7ded4d3f67a00208f9ba52"
        },
        {
            name: "Dưới những cơn mưa",
            singer: "Mr.Siro",
            path:
                "./assets/music/Duoinhungconmua.mp3",
            image: "https://i1.sndcdn.com/artworks-000203621416-14ciuz-t500x500.jpg"
        },
        {
            name: "Cho em",
            singer: "Mr.Siro",
            path: "./assets/music/ChoEm.mp3",
            image:
                "https://photo-resize-zmp3.zmdcdn.me/w360_r1x1_jpeg/avatars/2/1/3/0/2130334d4358f2727fbd721274791421.jpg"
        },
        {
            name: "Người yêu tôi lạnh lùng sắt đá",
            singer: "Mr.Siro",
            path: "./assets/music/Nguoiyeutoilanhlungsatda.mp3",
            image:
                "https://photo-resize-zmp3.zmdcdn.me/w240_r1x1_jpeg/cover/6/9/4/4/6944b95014e0aa283befab1bcd5f8cdd.jpg"
        },
        {
            name: "Đã từng vô giá ",
            singer: "Mr.Siro",
            path:
                "./assets/music/DaTungVoGia.mp3",
            image:
                "https://vietnammoi.mediacdn.vn/stores/news_dataimages/vudt/112017/15/02/3339_photo.jpg"
        },
        {
            name: "Nói hết lòng mình",
            singer: "Vương Anh Tú",
            path: "./assets/music/NoiHetLongMinh.mp3",
            image:
                "https://allvpop.com/wp-content/uploads/2021/06/49_300x300-2.jpg"
        }
    ],
    setConfig: function(key,value){
        this.config[key]= value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    render: function(){
        const htmls= this.songs.map(( song , index ) => {
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
            <div class="thumb" style="background-image: url(${song.image})">
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
        });
        playList.innerHTML = htmls.join("");

    },
    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex];
            }
        })
    },

    handleEvents: function(){
        const cdWidth = cd.offsetWidth;
        const _this = this;
        // Xử lý CD quay / dừng 
        const cdThumbAnimate= cdThumb.animate([
            {transform : 'rotate(360deg)'}
        ],{
            duration: 10000, // 10s
            iterations : Infinity,
        })
        cdThumbAnimate.pause(),

        // Xử lí zoom cd
        document.onscroll = function(){
            const scrollTop = document.documentElement.scrollTop||window.scrollY;
            const newCdWidth = cdWidth - scrollTop ;
            cd.style.width= newCdWidth > 0 ? newCdWidth  - 30 + 'px': 0;  
            cd.style.opacity= newCdWidth / cdWidth;
        }

        // Xử lý khi nhấn play
        playBtn.onclick= function(){
            if (_this.isPlaying ){
                audio.pause();
            } else {     
                audio.play();
            }
        }

        // Khi song được Play
        audio.onplay= function(){
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
        }
        // Khi song bị Pase
        audio.onpause= function(){
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        }
        // Khi tiến độ bài hát thay đổi 
        audio.ontimeupdate= function(){
            if(audio.duration){
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value= progressPercent;
            }
           
        }
        // Xử lý tua bài hát
        progress.onchange= function(e){
            const seekTime = audio.duration / 100 * e.target.value;
            audio.currentTime = seekTime;
        }
        // Khi next song
        nextBtn.onclick= function(){
            if(_this.isRandom){
                _this.playRandomSong();
            } else {
                _this.nextSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }
         // Khi prev song
         prevBtn.onclick= function(){
            if(_this.isRandom){
                _this.playRandomSong();
            } else {
                _this.prevSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }
        // Xử lí bật/ tắt  Random Song
        randomBtn.onclick= function(e){
            _this.isRandom= !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            randomBtn.classList.toggle('active',_this.isRandom);
        }

        // Xử lý next song khi audio ended 
        audio.onended= function() {
            if(_this.isRepeat){
                audio.play();
            } else {
                nextBtn.click();
            }
        }
        // Xử lý phát lại Song
        repeatBtn.onclick= function() {
            _this.isRepeat= !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);
            repeatBtn.classList.toggle('active',_this.isRepeat);
        }
        // Lắng nghe hành vi click vào playList
        playList.onclick= function(e) {
            const songNode = e.target.closest('.song:not(.active)');
            if((songNode) || e.target.closest('.option')) {
                // Xử lý click vào Song 
                if(songNode){
                    _this.currentIndex= Number (songNode.dataset.index);
                    _this.loadCurrentSong();
                    audio.play();
                    _this.render();
                }
                // Xử lý click vào Option
                if(e.target.closest('.option')){

                }

            }
        }

    },
    scrollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            });
        },300)
    },
    loadCurrentSong: function(){
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },
    loadConfig: function() {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },
    nextSong : function(){
        this.currentIndex++;
        if(this.currentIndex >= this.songs.length){
            this.currentIndex=0;
        };
        this.loadCurrentSong();
    },
    prevSong : function(){
        this.currentIndex--;
        if(this.currentIndex < 0){
            this.currentIndex= this.songs.length - 1;
        };
        this.loadCurrentSong();
    },
    playRandomSong : function () {
        let newIndex;
        do {
           newIndex= Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndex);
        this.currentIndex= newIndex;
        this.loadCurrentSong();
    },
    start : function(){
        // Gán cấu hình từ config vào ứng dụng
        this.loadConfig();

        // Định nghĩa các thuộc tính cho Object 
        this.defineProperties();

        // Lắng nghe / xử lý các sự kiện ( DOM Events)
        this.handleEvents();

        // Render ra playlist
        this.render();
        // tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong();

        // Hiển thị trạng thái ban đầu của button Random & Repeat
        randomBtn.classList.toggle('active',this.isRandom);
        repeatBtn.classList.toggle('active',this.isRepeat);
    }


}
app.start();