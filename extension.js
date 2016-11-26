const St = imports.gi.St;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;
const Lang = imports.lang;
const PanelMenu = imports.ui.panelMenu;
const Clutter = imports.gi.Clutter;
const Mainloop = imports.mainloop;
const Cairo = imports.cairo;

const debug = false;

let mouse_highlight;

/**
* Main shell extension object.
*/
const MouseHighlight = new Lang.Class({
    Name: 'MouseHighlight',
    Extends: PanelMenu.Button,

    /**
    * Initializes the shell extension object.
    */
    _init: function() {
        this.parent(0.0, "MouseHighlight");

        this.label = new St.Label({
            text: "Choose Highlighting",
            y_expand: true,
            y_align: Clutter.ActorAlign.CENTER
        });

        this.actor.add_actor(this.label);

        this.cnvs_actor = new Clutter.Actor();

        this.setup_cnvs_actor();
    },

    /**
    * Sets the size, background and offset of canvas actor. Shows it and
    * adds it to the main uiGroup. Connects the signals of the actor.
    */
    setup_cnvs_actor: function () {
        let pr_monitor = Main.layoutManager.primaryMonitor;
        this.offset = [pr_monitor.x, pr_monitor.y];
        this.cnvs_size = [pr_monitor.width, pr_monitor.height];

        if (debug == true) {
            let color = new Clutter.Color({
                red: 0,
                green: 255,
                blue: 0,
                alpha: 30
            });

            this.cnvs_actor.set_background_color(color);

            this.offset = [1000, 500];
            this.cnvs_size = [200, 200];
        }

        this.cnvs_actor.set_position(this.offset[0], this.offset[1]);
        this.cnvs_actor.set_width(this.cnvs_size[0]);
        this.cnvs_actor.set_height(this.cnvs_size[1]);
        this.cnvs_actor.show_all();
        this.cnvs_actor.set_reactive(true);
        this.cnvs_actor.connect("motion-event", this.mouse_move.bind(this));
        Main.uiGroup.add_actor(this.cnvs_actor);
    },

    /**
    * Draws a point at certain coordinates and offset. Called by
    * click events on the canvas.
    */
    draw_point: function(canvas, cr, width, height, coords, offset, draw) {
        let x = coords[0] - offset[0];
        let y = coords[1] - offset[1];

        cr.save();
        cr.setOperator(Cairo.Operator.CLEAR);
        cr.paint();
        cr.restore();
        cr.setOperator(Cairo.Operator.OVER);
        cr.setLineCap(Cairo.LineCap.ROUND);
        cr.setLineWidth(10);
        cr.translate(x, y);

        let gradient = new Cairo.RadialGradient(0, 0, 0, 0, 0, 20);
        gradient.addColorStopRGBA(0, 1, 1, 0, 1);
        gradient.addColorStopRGBA(20, 1, 1, 0, 0);
        cr.setSource(gradient);
        cr.arc(0, 0, 20, 0, Math.PI * 2);
        cr.fill();

        return draw;
    },

    /**
    * Runs when the mouse moves over the canvas. Calls a function that
    * draw a highlight under the mouse cursor.
    */
    mouse_move: function(actor, event) {
        let coords = event.get_coords();
        let self = this;

        let canvas = new Clutter.Canvas();
        canvas.set_size(this.cnvs_size[0],this.cnvs_size[1]);

        canvas.connect("draw", function(canvas, cr, width, height) {
            self.draw_point(canvas, cr, width, height, coords, self.offset, false);
        });

        canvas.invalidate();

        this.cnvs_actor.set_content(canvas);
    },

    destroy: function() {
        this.parent();
        this.cnvs_actor.destroy();
    },
});

/**
* Initializes the shell extension.
*/
function init() {

}

/**
* Runs when the shell extension is enabled.
*/
function enable() {
    mouse_highlight = new MouseHighlight();

    Main.panel.addToStatusArea('mouse-highlight', mouse_highlight, 1, 'right');
}

/**
* Runs when the shell extension is disabled.
*/
function disable() {
    mouse_highlight.destroy();
}
