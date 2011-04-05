/**
 * Easing functions for more dynamic animations in the cajal library
 */
(function () {

    cajal.Ease = {

        /**
         * Quadratic ease in
         * @param d total amount that should be changed over time
         * @param f current frame
         * @param t duration in frames
         * @return change of the value for frame f
         */
        quadIn: function(d, f, t) {
            f /= t;
            return 2 * f * d / t;
        },

        /**
         * Quadratic ease out
         * @param d total amount that should be changed over time
         * @param f current frame
         * @param t duration in frames
         * @return change of the value for frame f
         */
        quadOut: function(d, f, t) {
            f /= t;
            return -2 * (f - 1) * d / t;
        },

        /**
         * Quadratic ease in and ease out
         * @param d total amount that should be changed over time
         * @param f current frame
         * @param t duration in frames
         * @return change of the value for frame f
         */
        quadInOut: function(d, f, t) {
            f /= t / 2;
            if (f < 1) {
                return 2 * f * d / t;
            }
            f--;
            return -2 * (f - 1) * d / t;
        },

        /**
         * Exponential ease in
         * @param d total amount that should be changed over time
         * @param f current frame
         * @param t duration in frames
         * @param p power of the exponential function
         * @return change of the value for frame f
         */
        expIn: function(d, f, t, p) {
            p = p || 3;
            f /= t;
            return p * Math.pow(f, p - 1) * d / t;
        },

        /**
         * Exponential ease out
         * @param d total amount that should be changed over time
         * @param f current frame
         * @param t duration in frames
         * @param p power of the exponential function
         * @return change of the value for frame f
         */
        expOut: function(d, f, t, p) {
            return this.expIn(d, t-f, t, p);
        },

        /**
         * Exponential ease in and ease out
         * @param d total amount that should be changed over time
         * @param f current frame
         * @param t duration in frames
         * @param p power of the exponential function
         * @return change of the value for frame f
         */
        expInOut: function(d, f, t, p) {
            f /= t / 2;
            if (f < 1) {
                return this.expIn(d, f*t, t, p);
            }
            f--;
            return this.expOut(d, f*t, t, p);
        },

        /**
         * Back ease in
         * @param d total amount that should be changed over time
         * @param f current frame
         * @param t duration in frames
         * @param a amplitude of the overrun
         * @return change of the value for frame f
         */
        backIn: function(d, f, t, a) {
            a = a || 1.70158;
            f /= t;
            return f*(3*a*f+3*f-2*a)*d/t;
        },

        /**
         * Back ease out
         * @param d total amount that should be changed over time
         * @param f current frame
         * @param t duration in frames
         * @param a amplitude of the overrun
         * @return change of the value for frame f
         */
        backOut: function(d, f, t, a) {
            a = a || 1.70158;
            f /= t;
            f -= 1;
            return f * (3 * a * f + 3 * f + 2 * a) * d / t;
        },

        /**
         * Back ease in and out
         * @param d total amount that should be changed over time
         * @param f current frame
         * @param t duration in frames
         * @param a amplitude of the overrun
         * @return change of the value for frame f
         */
        backInOut: function(d, f, t, a) {
            a = a || 1.70158 * 1.525;
            f /= t / 2;
            if (f < 1) {
                return f * (3 * a * f + 3 * f - 2 * a) * d / t;
            }
            f -= 2;
            return f * (3 * a * f + 3 * f + 2 * a) * d / t;
        },

        /**
         * Bounce ease in
         * @param d total amount that should be changed over time
         * @param f current frame
         * @param t duration in frames
         * @return change of the value for frame f
         */
        bounceIn: function(d, f, t) {
            return this.bounceOut(d, t-f, t);
        },

        /**
         * Bounce ease out
         * @param d total amount that should be changed over time
         * @param f current frame
         * @param t duration in frames
         * @return change of the value for frame f
         */
        bounceOut: function(d, f, t) {
            f/=t;
            if (f < (1/2.75)) {
                return (7.5625 * 2 * f) * d / t;
            } else if (f < (2/2.75)) {
                return (7.5625 * 2 * (f - (1.5 / 2.75))) * d / t;
            } else if (f < (2.5/2.75)) {
                return (7.5625 * 2 * (f - (2.25 / 2.75))) * d / t;
            } else {
                return (7.5625 * 2 * (f - (2.625 / 2.75))) * d / t;
            }
        },

        /**
         * Bounce ease in and out
         * @param d total amount that should be changed over time
         * @param f current frame
         * @param t duration in frames
         * @return change of the value for frame f
         */
        bounceInOut: function(d, f, t) {
            if (f < t/2) {
                return this.bounceIn(d, f*2, t);
            }
            return this.bounceOut(d, f*2-t, t);
        },

        /**
         * Elastic ease in
         * @param d total amount that should be changed over time
         * @param f current frame
         * @param t duration in frames
         * @param p number of oscillation
         * @return change of the value for frame f
         */
        elasticIn: function(d, f, t, p) {
            f /= t;
            p = p || 3;
            var pi = Math.PI;
            var T = 1 / (p + 0.25);
            return d / t * (2 / 9) * Math.pow(f, 3.5) * Math.sin(f * 2 * pi / T) + d / t * Math.pow(f, 4.5) * Math.cos(f * 2 * pi / T) * (2 * pi / T);
        },

        /**
         * Elastic ease out
         * @param d total amount that should be changed over time
         * @param f current frame
         * @param t duration in frames
         * @param p number of oscillation
         * @return change of the value for frame f
         */
        elasticOut: function(d, f, t, p) {
            return this.elasticIn(d, t-f, t, p);
        },

        /**
         * Elastic ease in and out
         * @param d total amount that should be changed over time
         * @param f current frame
         * @param t duration in frames
         * @param p number of oscillation
         * @return change of the value for frame f
         */
        elasticInOut: function(d, f, t, p) {
            if (f < t/2) {
                return this.elasticIn(d, f*2, t, p);
            }
            return this.elasticOut(d, f*2-t, t, p);
        }

    };
})();
