class ShakaPlugin {
  constructor(video, options) {
    this.video = video
    this.options = options
  }

  initialize() {
    const seekBar = document.getElementsByClassName('shaka-seek-bar')
    if(this.video && this.video.duration && seekBar) {
      for(let [index, value] of this.options.thumbnails.entries()) {
        let thumbnail = document.createElement('img')
        thumbnail.originalHeight = thumbnail.clientHeight
        thumbnail.id = 'thumbnail-' + index
        thumbnail.src = value.src
        thumbnail.className = 'shaka-thumbnail-' + index
        thumbnail.style.position = 'absolute'
        thumbnail.style.display = 'none'
        if(this.video.parentNode) {
          this.video.parentNode.appendChild(thumbnail)
        } else {
          const parent = document.body
          parent.appendChild(thumbnail)
        }
      }
     
      for (let i = 0; i < seekBar.length; i++) {
        if (seekBar[i] instanceof HTMLElement) {
          seekBar[i].addEventListener('mousemove', this.mouseEnter.bind(this))
          seekBar[i].addEventListener('mouseleave', this.mouseLeave.bind(this))
          seekBar[i].addEventListener('touchmove', this.mouseEnter.bind(this))
          seekBar[i].addEventListener('touchend', this.mouseLeave.bind(this))
          seekBar[i].addEventListener('touchcancel', this.mouseLeave.bind(this))
        }
      }
    }
  }

  mouseEnter(event) {
    const seekBar = document.getElementsByClassName('shaka-seek-bar')
    for (let i = 0; i < seekBar.length; i++) {
      if (seekBar[i] instanceof HTMLElement) {
        const rect = this.video.getBoundingClientRect()
        
        // Margin left of Video tag and window
        const mlv = rect.left
        // Because the seekBar is the center of the video
        // Margin between video and the progess bar
        const mbvs = (this.video.offsetWidth - seekBar[i].offsetWidth) / 2
        // Your real event on the progress bar
        let myEvent = event.clientX - mlv - mbvs
        // Start position of the progress bar
        const sppb = mlv + mbvs

        const tmv = this.options.thumbnails.filter(tm => (event.clientX - sppb - seekBar[i].offsetWidth * (tm.endTime ? tm.endTime : this.video.duration) / this.video.duration) < 0)[0]
        const tmi = this.options.thumbnails.findIndex(tm => (event.clientX - sppb - seekBar[i].offsetWidth * (tm.endTime ? tm.endTime : this.video.duration) / this.video.duration) < 0)

        if(tmv && tmi !== null) {
          const thumbnailPixel = seekBar[i].offsetWidth / (this.video.duration / tmv.displayTime)

          const thumbnail = document.getElementById('thumbnail-' + tmi)

          if(thumbnail) {
            if (myEvent < 0) {
              myEvent = 0
            }
  
            if (myEvent > (seekBar[i].offsetWidth - mbvs)) {
              myEvent = seekBar[i].offsetWidth - mbvs
            }
            const row = Math.floor((myEvent / thumbnailPixel) % tmv.row)
            let column = Math.floor(myEvent / (tmv.row * thumbnailPixel))
            console.log(column)
  
            if(column >= this.getColumnThumbnail(tmi)) {
              column = column - this.getColumnThumbnail(tmi) + 1
            }
  
            thumbnail.style.display = 'block'
            seekBar[i].style.cursor = 'pointer'
            thumbnail.style.left =
              event.clientX -
              thumbnail.clientWidth / tmv.row +
              80 -
              mlv -
              tmv.width * row +
              'px'
  
            thumbnail.style.top = rect.height - 150 - tmv.height * column + 'px'
            thumbnail.style.clip = `rect(${tmv.height * column}px, ${tmv.width *
              (row + 1)}px, ${tmv.height * (column + 1)}px, ${tmv.width * row}px)`
          }
        }
      }
    }
  }

  mouseLeave() {
    for(let i = 0; i < this.options.thumbnails.length; i++) {
      const thumbnail = document.getElementById('thumbnail-' + i)
      if (thumbnail) {
        thumbnail.style.display = 'none'
      }
    }
  }

  getColumnThumbnail(index) {
    if(index > 0) {
      const thumbnail = document.getElementById('thumbnail-' + (index - 1))
      return Math.round(thumbnail.clientHeight / this.options.thumbnails[index - 1].height)
    }
  }
}

module.exports = ShakaPlugin;
