<template>
  <article class="workout-assistant column j-end">
    <section class="navigation row j-between a-center">
      <button
        class="flaticon-left-arrow-2"
        @click="$store.commit('assistant/toggleWorkoutAssistant')"
      />
      <p v-if="isLastSet" class="navigation__last-set">
        ostatnia seria!
      </p>
    </section>
    <Video :source="video" :key="controls.unit" opacity="0.2" />  
    <section class="controls row">
      <button class="control" @click="previousUnit" />
      <button class="control" @click="nextUnit" />
    </section>
    <transition name="slide-to-right">
      <Stopwatch v-if="stopwatchOn" />
    </transition>
    <section class="exercise row a-end j-between">
      <div class="exercise__name">
        <MovingText v-if="showWorkoutAssistant" :key="`name${current.exercise.name}`">
          <h3 class="m00 t-white">
            {{ current.exercise.name }}
          </h3>
        </MovingText>
        <MovingText v-if="current.remarks" :key="`reps${current.exercise.name}`">
          <p class="fs-12 m00">
            {{ current.remarks }}
          </p>
        </MovingText>
        <p v-else class="fs-12 m00">
          Wykonaj teraz
        </p>
      </div>
      <div class="exercise__numbers">
        <p 
          v-if="current.time && !current.reps" 
          class="exercise__numbers__time"> 
          {{ timeleft | showMinutes }}
        </p>
        <p v-else class="exercise__numbers__time">
          {{ repetitions }}
        </p>
      </div>
    </section>
    <section class="progress">
      <div class="progress-data row j-between">
        <p class="m00 fs-12">
          {{
            `${sections[controls.section].name} ${controls.complex + 1}/${
              sections[controls.section].complexes.length
            }`
          }}
        </p>
        <p v-if="isScreenDivided" class="m00 fs-12">
          {{ workout.user.fullname | getName }}
        </p>
      </div>
      <div class="progress-bars row j-between">
        <span
          v-for="(unit, index) in units"
          :key="index"
          class="progress-bar"
          :class="{ 'b-white': index <= controls.unit }"
          @click="controls.unit = index"
        />
      </div>
    </section>
    <section class="buttons">
      <div class="buttons__functions">
        <button
          v-if="soundEnabled"
          class="button flaticon-sound"
          @click="soundEnabled = false"
        />
        <button 
          v-else 
          class="button flaticon-mute" 
          @click="soundEnabled = true" 
        />
        <button
          class="button flaticon-login"
          :class="{ 't-headers': automaticModeOn }"
          @click="toggleAutomaticMode"
        />
        <button
          class="button flaticon-counterclockwise"
          :class="{ 't-headers': stopwatchOn }"
          @click="stopwatchOn = !stopwatchOn"
        />
        <button
          class="button flaticon-menu"
          @click="$emit('edit-feedback', current)"
          :disabled="!current.sets"
        />
      </div>
      <Timer
        :time="current.time"
        :active="current.time > 0 && !current.reps"
        :automatic="automaticModeOn"
        :key="controls.unit"
        @countdown-over="nextUnit"
        @beep="playAudio($event)"
        @update-time="timeleft = $event">
      </Timer>
    </section>
  </article>
</template>

<script>

export default {
  props: {
    workout: {
      type: Object,
    },
    isScreenDivided: {
      type: Boolean,
      default: () => true,
    },
    sectionIndex: {
      type: Number,
      default: () => 0,
    },
  },
  data() {
    return {
      audio: null,
      sections: this.workout.sections,
      controls: {
        section: this.sectionIndex,
        complex: 0,
        unit: 0,
      },
      stopwatchOn: false,
      automaticModeOn: true,
      soundEnabled: true,
      timeleft: null,
    }
  },
  watch: {
    currentUnit() {
      this.$emit("set-current-section", this.controls.section)
      if (this.current.exercise.name == "Odpocznij") {
        this.playAudio("luz.mp3")
      } else if (
        this.current.reps ||
        this.current.time ||
        this.current.distance
      ) {
        this.playAudio(this.isLastSet ? "ostatniaseria.mp3" : "dzialaj.mp3")
      }
    },
    soundEnabled(value) {
      if (!this.audio) {
        this.audio = new Audio()
      }

      if (value) {
        this.audio.volume = 1
      } else if (!value) {
        this.audio.volume = 0
      }
    },
    async showWorkoutAssistant(value) {
      if (value && this.controls.section != this.sectionIndex) {
        if (await this.$root.$confirm("Wznowić asystenta?")) {
          this.$emit("set-current-section", this.controls.section)
        } else {
          this.controls.section = this.sectionIndex
          this.controls.complex = 0
          this.controls.unit = 0
        }
      }
    },
  },
  computed: {
    showWorkoutAssistant() {
      return this.$store.state.assistant.showWorkoutAssistant
    },
    currentUnit() {
      return this.controls.unit
    },
    current() {
      return this.units[this.controls.unit]
    },
    repetitions() {
      let repetitions = '';
      if (this.current.reps) repetitions += `${this.current.reps}`;
      if (this.current.reps && this.current.time) repetitions += `x`;
      if (this.current.time) repetitions += `${this.current.time}s`;
      if (this.current.distance) repetitions = `${this.current.distance}m`;
      return repetitions;
    },
    isLastSet() {
      const lastIndex = this.units.lastIndexOf(this.units[this.controls.unit])
      return lastIndex == this.controls.unit &&
        this.units[this.controls.unit].sets > 1
        ? true
        : false
    },
    next() {
      return this.units[this.controls.unit + 1]
    },
    video() {
      let video
      
      if (this.current.exercise.name == "Odpocznij" || this.current.exercise.name == "Rozpoczynasz nowy blok") {
        video = this.next.exercise.image
          ? this.next.exercise.image.url
          : "https://media.giphy.com/media/fdlcvptCs4qsM/giphy.gif"
      } else {
        video = this.current.exercise.image
          ? this.current.exercise.image.url
          : "https://media.giphy.com/media/fdlcvptCs4qsM/giphy.gif"
      }

      return video.replace(".gif", ".mp4")
    },
    units() {
      let units = []

      // Get array of arrays containing all sets of a given exercise
      // IE: 3x8 e1, 3x6 e2
      // => [[e1, e1, e1], [e2, e2, e2]]
      this.sections[this.controls.section].complexes[this.controls.complex].units.forEach((unit) => {
        const groupedUnits = []
        for (let x = 0; x < unit.sets; x++) {
          groupedUnits.push(unit)
        }
        units.push(groupedUnits)
      })

      // Sort arrays pushing the longest to the front
      // [[e1, e1, e1], [e2, e2, e2, e2]]
      // => [[e2, e2, e2, e2], [e1, e1, e1]]
      units = units.sort((a, b) => {
        return b.length - a.length
      })

      // Zip the exercises creating two arrays
      // [[e2, e2, e2, e2], [e1, e1, e1]]
      // => [[e2, e1], [e2, e1], [e2, e1], [e2, undefined]]
      units = _.zip(...units)

      // Flatten the main array, removing nested arrays
      // [[e2, e1], [e2, e1], [e2, e1], [e2, undefined]]
      // => [e2, e1, e2, e1, e2, e1, e2, undefined]
      units = _.flattenDeep(units)

      // Filter the array to remove undefined if exists
      units = units.filter((unit) => {
        return unit != undefined
      })

      // Add the rest intervals if there should be any
      for (let i = 0; i <= units.length - 1; i++) {
        let time = units[i].rest
        if (time > 0 && i < units.length - 1) {
          let remarks = `Następnie: ${units[i + 1].exercise.name}`
          if (units[i+1].remarks) { 
            remarks += ` (${units[i+1].remarks})`
          }
          units.splice(i + 1, 0, {
            exercise: { name: "Odpocznij" },
            time,
            remarks,
          })
        }
      }

      units.unshift({
        exercise: { name: "Rozpoczynasz nowy blok" },
        remarks: "Kolejne ćwiczenie widoczne jest na ekranie",
      })

      if (
        this.controls.complex ==
          this.sections[this.controls.section].complexes.length - 1 &&
        this.controls.section == this.sections.length - 1
      ) {
        units.push({
          exercise: { name: "Ukończyłeś trening" },
          remarks: "Daj znać trenerowi, jak poszło!",
        })
      }

      return units
    },
  },
  methods: {
    setNotification(message) {
      this.$store.commit('main/setNotification', message)
    },
    nextUnit() {
      this.controls.unit++
      if (this.controls.unit > this.units.length - 1) {
        this.nextComplex()
      }
    },
    previousUnit() {
      this.controls.unit--
      if (this.controls.unit < 0) {
        this.previousComplex()
      }
    },
    nextComplex() {
      this.controls.complex++
      if (this.controls.complex > this.sections[this.controls.section].complexes.length - 1) {
        this.nextSection()
      } else {
        this.controls.unit = 0
      }
    },
    previousComplex() {
      this.controls.complex--
      if (this.controls.complex < 0) {
        this.previousSection()
      } else {
        this.controls.unit = this.units.length - 1
      }
    },
    nextSection() {
      this.controls.section++
      if (this.controls.section > this.sections.length - 1) {
        this.controls.section = this.sections.length - 1
        this.controls.complex = this.sections[this.controls.section].complexes.length - 1
        this.controls.unit = this.units.length - 1
      } else {
        this.controls.unit = 0
        this.controls.complex = 0
      }
    },
    previousSection() {
      this.controls.section--
      if (this.controls.section < 0) {
        this.controls.complex = 0
        this.controls.unit = 0
        this.controls.section = 0
      } else {
        this.controls.complex =
          this.sections[this.controls.section].complexes.length - 1
        this.controls.unit = this.units.length - 1
      }
    },
    toggleAutomaticMode() {
      this.automaticModeOn = !this.automaticModeOn
      if (this.automaticModeOn) {
        this.setNotification("Tryb automatyczny włączony")
      } else {
        this.setNotification("Tryb automatyczny wyłączony")
      }
    },
    playAudio(audio) {
      if (!this.audio) this.audio = new Audio()
      this.audio.src = require(`@/assets/sounds/${audio}`)
      this.audio.play()
    },
  },
}
</script>

<style lang="scss" scoped>
.workout-assistant {
  height: 100vh;
  padding: 0 1rem;
  position: relative;
  overflow: hidden;
}

.navigation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 1rem;
  z-index: 2;
}

.navigation__last-set {
  margin: 0;
  font-size: 13px;
  color: color(headers);
}

.video {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  object-fit: cover;
}

.controls {
  margin-left: -1rem;
  width: 100vw;
  height: 100%;
}

.control {
  width: 100%;
  &:active {
    // give some styles to a button once it's clicked, for example moving arrow like in youtube
  }
}

.exercise {
  padding: 1rem 0;
  z-index: 2;
}

.exercise__name {
  overflow: hidden;
}

.exercise__numbers {
  padding-left: 1rem;
}

.exercise__numbers__time {
  line-height: 1;
  font-size: 32px;
  margin: 0;
  color: color(headers);
}

.progress {
  z-index: 2;
}

.progress-data {
  margin-bottom: 1px;
}

.progress-bar {
  height: 2px;
  flex: 1;
  margin-right: 1px;
  background: gray;
  &:last-child {
    margin: 0;
  }
}

.buttons {
  padding: .5rem 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.buttons__functions {
  display: flex;
}

.button {
  margin-right: .5rem;
  font-size: 16px;
  &:disabled {
    color: color(faded);
  }
}
</style>
