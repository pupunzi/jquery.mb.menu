/*******************************************************************************
 jquery.mb.components
 Copyright (c) 2001-2010. Matteo Bicocchi (Pupunzi); Open lab srl, Firenze - Italy
 email: info@pupunzi.com
 site: http://pupunzi.com

 Licences: MIT, GPL
 http://www.opensource.org/licenses/mit-license.php
 http://www.gnu.org/licenses/gpl.html
 ******************************************************************************/

/*
 * Name:jquery.mb.menu
 * Version: 2.8.1
 */

// to get the element that is fireing a contextMenu event you have $.mbMenu.lastContextMenuEl that returns an object.

(function($) {
  $.mbMenu = {
    name:"mbMenu",
    author:"Matteo Bicocchi",
    version:"2.8.1",
    actualMenuOpener:false,
    options: {
      template:"yourMenuVoiceTemplate",// the url that returns the menu voices via ajax. the data passed in the request is the "menu" attribute value as "menuId"
      additionalData:"",
      menuSelector:".menuContainer",
      menuWidth:400,
      openOnRight:false,
      containment:"window",
      iconPath:"ico/",
      hasImages:true,
      fadeInTime:100,
      fadeOutTime:200,
      menuTop:0,
      menuLeft:0,
      submenuTop:0,
      submenuLeft:4,
      opacity:1,
      shadow:false,
      shadowColor:"transparent",
      shadowOpacity:.2,
      openOnClick:true,
      closeOnMouseOut:false,
      closeAfter:500,
      minZindex:"auto", // or number
      hoverIntent:0, //if you use jquery.hoverIntent.js set this to time in milliseconds; 0= false;
      submenuHoverIntent:200, //if you use jquery.hoverIntent.js set this to time in milliseconds; 0= false;
      onContextualMenu:function(){} //it pass 'o' (the menu you clicked on) and 'e' (the event)
    },
    buildMenu : function (options){
      return this.each (function ()
      {
        var thisMenu =this;
        thisMenu.id = !this.id ? "menu_"+Math.floor (Math.random () * 1000): this.id;
        this.options = {};
        $.extend (this.options, $.mbMenu.options);
        $.extend (this.options, options);

        $(".mbmenu").hide();
        thisMenu.clicked = false;
        thisMenu.rootMenu=false;
        thisMenu.clearClicked=false;
        thisMenu.actualOpenedMenu=false;
        thisMenu.menuvoice=false;
        var root=$(this);
        var openOnClick=this.options.openOnClick;
        var closeOnMouseOut=this.options.closeOnMouseOut;

        //build roots
        $(root).each(function(){

          /*
           *using metadata plugin you can add attribute writing them inside the class attr with a JSON sintax
           * for ex: class="rootVoice {menu:'menu_2'}"
           */
          if ($.metadata){
            $.metadata.setType("class");
            thisMenu.menuvoice=$(this).find(".rootVoice");
            $(thisMenu.menuvoice).each(function(){
              if ($(this).metadata().menu) $(this).attr("menu",$(this).metadata().menu);
            });
          }

          thisMenu.menuvoice=$(this).find("[menu]").add($(this).filter("[menu]"));

          $(thisMenu.menuvoice).each(function(){
            $(this).addClass("rootVoice");
            $(this).attr("nowrap","nowrap");
          });
          if(openOnClick){
            $(thisMenu.menuvoice).bind("click",function(){
              if (!$(this).attr("isOpen")){
                $(this).buildMbMenu(thisMenu,$(this).attr("menu"));
                $(this).attr("isOpen","true");
              }else{
                $(this).removeMbMenu(thisMenu,true);
                $(this).addClass("selected");
              }

              //empty
              if($(this).attr("menu")=="empty"){
                if(thisMenu.actualOpenedMenu){
                  $(thisMenu.actualOpenedMenu).removeClass("selected");
                  thisMenu.clicked=true;
                  $(this).removeAttr("isOpen");
                  clearTimeout(thisMenu.clearClicked);
                }
                $(this).removeMbMenu(thisMenu);
              }

              $(document).unbind("click.closeMbMenu");

              //return;
            });
          }
          var mouseOver=$.browser.msie?"mouseenter":"mouseover";
          var mouseOut=$.browser.msie?"mouseleave":"mouseout";
          if (this.options.hoverIntent==0){
            $(thisMenu.menuvoice).bind(mouseOver,function(){
              if (closeOnMouseOut) clearTimeout($.mbMenu.deleteOnMouseOut);
              if (!openOnClick) $(thisMenu).find(".selected").removeClass("selected");
              if(thisMenu.actualOpenedMenu){ $(thisMenu.actualOpenedMenu).removeClass("selected");}
              $(this).addClass("selected");
              if((thisMenu.clicked || !openOnClick) && !$(this).attr("isOpen")){
                clearTimeout(thisMenu.clearClicked);
                $(this).buildMbMenu(thisMenu,$(this).attr("menu"));
                if ($(this).attr("menu")=="empty"){
                  $(this).removeMbMenu(thisMenu);
                  $(this).removeAttr("isOpen");
                }
              }
            });
            $(thisMenu.menuvoice).bind(mouseOut,function(){
              if (closeOnMouseOut)
                $.mbMenu.deleteOnMouseOut= setTimeout(function(){$(this).removeMbMenu(thisMenu,true);$(document).unbind("click.closeMbMenu");},$(root)[0].options.closeAfter);
              if ($(this).attr("menu")=="empty"){
                $(this).removeClass("selected");
                thisMenu.clearClicked= setTimeout(function(){thisMenu.rootMenu=false;thisMenu.clicked=false;},$(root)[0].options.closeAfter);
              }
              if(!thisMenu.clicked)
                $(this).removeClass("selected");
              $(document).one("click.closeMbMenu",function(){
                if ($(this).attr("menu")=="empty"){
                  clearTimeout(thisMenu.clearClicked);
                  return;
                }
                $(this).removeClass("selected");
                $(this).removeMbMenu(thisMenu,true);
              });
            });
          }else{
            // HOVERHINTENT
            $(thisMenu.menuvoice).hoverIntent({
              over:function(){
                if (closeOnMouseOut) clearTimeout($.mbMenu.deleteOnMouseOut);
                if (!openOnClick) $(thisMenu).find(".selected").removeClass("selected");
                if(thisMenu.actualOpenedMenu){ $(thisMenu.actualOpenedMenu).removeClass("selected");}
                $(this).addClass("selected");
                if((thisMenu.clicked || !openOnClick)  && !$(this).attr("isOpen")){
                  clearTimeout(thisMenu.clearClicked);
                  $(this).buildMbMenu(thisMenu,$(this).attr("menu"));
                  if ($(this).attr("menu")=="empty"){
                    $(this).removeMbMenu(thisMenu);
                    $(this).removeAttr("isOpen");
                  }
                }
              },
              sensitivity: 30,
              interval: this.options.hoverIntent,
              timeout: 0,
              out:function(){
                if (closeOnMouseOut)
                  $.mbMenu.deleteOnMouseOut= setTimeout(function(){$(this).removeMbMenu(thisMenu,true);$(document).unbind("click.closeMbMenu");},$(root)[0].options.closeAfter);
                if ($(this).attr("menu")=="empty"){
                  $(this).removeClass("selected");
                  thisMenu.clearClicked= setTimeout(function(){thisMenu.rootMenu=false;thisMenu.clicked=false;},$(root)[0].options.closeAfter);
                }
                if(!thisMenu.clicked)
                  $(this).removeClass("selected");
                if(!closeOnMouseOut)
                  $(document).one("click.closeMbMenu",function(){
                    if ($(this).attr("menu")=="empty"){
                      clearTimeout(thisMenu.clearClicked);
                      return;
                    }
                    $(this).removeClass("selected");
                    $(this).removeMbMenu(thisMenu,true);
                  });
              }
            });
          }

        });
      });
    },
    buildContextualMenu :  function (options){
      return this.each (function ()
      {
        var thisMenu = this;
        thisMenu.options = {};
        $.extend (thisMenu.options, $.mbMenu.options);
        $.extend (thisMenu.options, options);
        $(".mbmenu").hide();
        thisMenu.clicked = false;
        thisMenu.rootMenu=false;
        thisMenu.clearClicked=false;
        thisMenu.actualOpenedMenu=false;
        thisMenu.menuvoice=false;

        /*
         *using metadata plugin you can add attribut writing them inside the class attr with a JSON sintax
         * for ex: class="rootVoice {menu:'menu_2'}"
         */
        var cMenuEls;
        if ($.metadata){
          $.metadata.setType("class");
          cMenuEls= $(this).find(".cmVoice");
          $(cMenuEls).each(function(){
            if ($(this).metadata().cMenu) $(this).attr("cMenu",$(this).metadata().cMenu);
          });
        }
        cMenuEls= $(this).find("[cMenu]").add($(this).filter("[cMenu]"));

        $(cMenuEls).each(function(){
          $(this).css("-khtml-user-select","none");
          var cm=this;
          cm.id = !cm.id ? "menu_"+Math.floor (Math.random () * 100): cm.id;
          $(cm).css({cursor:"default"});
          $(cm).bind("contextmenu","mousedown",function(event){
            event.preventDefault();
            event.stopPropagation();
            event.cancelBubble=true;

            $.mbMenu.lastContextMenuEl=cm;

            if ($.mbMenu.options.actualMenuOpener) {
              $(thisMenu).removeMbMenu($.mbMenu.options.actualMenuOpener);
            }
            /*add custom behavior to contextMenuEvent passing the el and the event
             *you can for example store to global var the obj that is fireing the event
             *mbActualContextualMenuObj=cm;
             *
             * you can for example create a function that manipulate the voices of the menu
             * you are opening according to a certain condition...
             */

            thisMenu.options.onContextualMenu(this,event);

            $(this).buildMbMenu(thisMenu,$(this).attr("cMenu"),"cm",event);
            $(this).attr("isOpen","true");

          });
        });
      });
    }
  };
  $.fn.extend({
    buildMbMenu: function(op,m,type,e){
      var msie6=$.browser.msie && $.browser.version=="6.0";
      var mouseOver=$.browser.msie?"mouseenter":"mouseover";
      var mouseOut=$.browser.msie?"mouseleave":"mouseout";
      if (e) {
        this.mouseX=$(this).getMouseX(e);
        this.mouseY=$(this).getMouseY(e);
      }

      if ($.mbMenu.options.actualMenuOpener && $.mbMenu.options.actualMenuOpener!=op)
        $(op).removeMbMenu($.mbMenu.options.actualMenuOpener);
      $.mbMenu.options.actualMenuOpener=op;
      if(!type || type=="cm")	{
        if (op.rootMenu) {
          $(op.rootMenu).removeMbMenu(op);
          $(op.actualOpenedMenu).removeAttr("isOpen");
        }
        op.clicked=true;
        op.actualOpenedMenu=this;
        $(op.actualOpenedMenu).attr("isOpen","true");
        $(op.actualOpenedMenu).addClass("selected");
      }
      var opener=this;
      var where=(!type|| type=="cm")?$(document.body):$(this).parent().parent();

      //empty
      if($(this).attr("menu")=="empty"){
        return;
      }

      var menuClass= op.options.menuSelector.replace(".","");
      where.append("<div class='menuDiv'><div class='"+menuClass+"'></div></div>");
      this.menu  = where.find(".menuDiv");
      $(this.menu).css({width:0, height:0});
      if (op.options.minZindex!="auto"){
        $(this.menu).css({zIndex:op.options.minZindex++});
      }else{
        $(this.menu).mb_bringToFront();
      }
      this.menuContainer  = $(this.menu).find(op.options.menuSelector);
      $(this.menuContainer).bind(mouseOver,function(){
        $(opener).addClass("selected");
      });
      $(this.menuContainer).css({
        position:"absolute",
        opacity:op.options.opacity
      });
      if (!$("#"+m).html()){
        $.ajax({
          type: "POST",
          url: op.options.template,
          cache: false,
          async: false,
          data:"menuId="+m+(op.options.additionalData!=""?"&"+op.options.additionalData:""),
          success: function(html){
            $("body").append(html);
            $("#"+m).hide();
          }
        });
      }
      $(this.menuContainer).attr("id", "mb_"+m).hide();
      this.voices= $("#"+m).find("a").clone(true);


      if (op.options.shadow) {
        var shadow = $("<div class='menuShadow'></div>").hide();
        if(msie6)
          shadow = $("<iframe class='menuShadow'></iframe>").hide();
      }

      /*
       *using metadata plugin you can add attribut writing them inside the class attr with a JSON sintax
       * for ex: class="rootVoice {menu:'menu_2'}"
       */
      if ($.metadata){
        $.metadata.setType("class");
        $(this.voices).each(function(){
          if ($(this).metadata().disabled) $(this).attr("disabled",$(this).metadata().disabled);
          if ($(this).metadata().img) $(this).attr("img",$(this).metadata().img);
          if ($(this).metadata().menu) $(this).attr("menu",$(this).metadata().menu);
          if ($(this).metadata().action) $(this).attr("action",$(this).metadata().action);
          if ($(this).metadata().disabled) $(this).attr("disabled",$(this).metadata().disabled);
        });
      }

      // build each voices of the menu
      $(this.voices).each(function(i){

        var voice=this;
        var imgPlace="";
        var isText=$(voice).attr("rel")=="text";
        var isTitle=$(voice).attr("rel")=="title";
        var isDisabled=$(voice).is("[disabled]");
        var isSeparator=$(voice).attr("rel")=="separator";

        if (op.options.hasImages && !isText){

          var imgPath=$(voice).attr("img")?$(voice).attr("img"):"blank.gif";
          imgPath=(imgPath.length>3 && imgPath.indexOf(".")>-1)?"<img class='imgLine' src='"+op.options.iconPath+imgPath+"'>":imgPath;
          imgPlace="<td class='img'>"+imgPath+"</td>";
        }
        var line="<table id='"+m+"_"+i+"' class='line"+(isTitle?" title":"")+"' cellspacing='0' cellpadding='0' border='0' style='width:100%;' width='100%'><tr>"+imgPlace+"<td class='voice' nowrap></td></tr></table>";
        if(isSeparator)
          line="<p class='separator' style='width:100%;'></p>";
        if(isText)
          line="<div style='width:100%; display:table' class='line' id='"+m+"_"+i+"'><div class='voice'></div></div>";

        $(opener.menuContainer).append(line);

        var menuLine = $(opener.menuContainer).find("#" + m + "_" + i);
        var menuVoice = menuLine.find(".voice");
        if(!isSeparator){
          menuVoice.append(this);
          if($(this).attr("menu")){
            menuLine.find(".voice a").wrap("<div class='menuArrow'></div>");
            menuLine.find(".menuArrow").addClass("subMenuOpener");
            menuLine.css({cursor:"default"});
            this.isOpener=true;
          }
          if(isText){
            menuVoice.addClass("textBox");
            if ($.browser.msie) menuVoice.css({maxWidth:op.options.menuWidth});

            this.isOpener=true;
          }
          if(isDisabled){
            menuLine.addClass("disabled").css({cursor:"default"});
          }

          if(!(isText || isTitle || isDisabled)){
            menuLine.css({cursor:"pointer"});
            if (op.options.submenuHoverIntent==0){
              menuLine.bind("mouseover",function(event){
                clearTimeout($.mbMenu.deleteOnMouseOut);
                $(this).addClass("selected");
                if(opener.menuContainer.actualSubmenu && !$(voice).attr("menu")){
                  $(opener.menu).find(".menuDiv").remove();
                  $(opener.menuContainer.actualSubmenu).removeClass("selected");
                  opener.menuContainer.actualSubmenu=false;
                  //return false;
                }
                if ($(voice).attr("menu")){

                  if(opener.menuContainer.actualSubmenu && opener.menuContainer.actualSubmenu!=this){
                    $(opener.menu).find(".menuDiv").remove();
                    $(opener.menuContainer.actualSubmenu).removeClass("selected");
                    opener.menuContainer.actualSubmenu=false;
                  }
                  if (!$(voice).attr("action")) $(opener.menuContainer).find("#"+m+"_"+i).css("cursor","default");
                  if (!opener.menuContainer.actualSubmenu || opener.menuContainer.actualSubmenu!=this){
                    $(opener.menu).find(".menuDiv").remove();

                    opener.menuContainer.actualSubmenu=false;
                    $(this).buildMbMenu(op,$(voice).attr("menu"),"sm",event);
                    opener.menuContainer.actualSubmenu=this;
                  }
                  $(this).attr("isOpen","true");
                  return false;
                }
              });
            }else{
              // HOVERHINTENT
              menuLine.bind("mouseover",function(){
                clearTimeout($.mbMenu.deleteOnMouseOut);
                $(this).addClass("selected");
              });
              menuLine.hoverIntent({
                over:function(event){
                  if(opener.menuContainer.actualSubmenu && !$(voice).attr("menu")){
                    $(opener.menu).find(".menuDiv").remove();
                    $(opener.menuContainer.actualSubmenu).removeClass("selected");
                    opener.menuContainer.actualSubmenu=false;
                  }
                  if ($(voice).attr("menu")){

                    if(opener.menuContainer.actualSubmenu && opener.menuContainer.actualSubmenu!=this){
                      $(opener.menu).find(".menuDiv").remove();
                      $(opener.menuContainer.actualSubmenu).removeClass("selected");
                      opener.menuContainer.actualSubmenu=false;
                    }
                    if (!$(voice).attr("action")) $(opener.menuContainer).find("#"+m+"_"+i).css("cursor","default");
                    if (!opener.menuContainer.actualSubmenu || opener.menuContainer.actualSubmenu!=this){
                      $(opener.menu).find(".menuDiv").remove();

                      opener.menuContainer.actualSubmenu=false;
                      $(this).buildMbMenu(op,$(voice).attr("menu"),"sm",event);
                      opener.menuContainer.actualSubmenu=this;
                    }
                    $(this).attr("isOpen","true");
                    return false;
                  }
                },
                out:function(){},
                sensitivity: 30,
                interval: op.options.submenuHoverIntent,
                timeout: 0
              });
            }

            menuLine.bind(mouseOut,function(){
              $(this).removeClass("selected");
            });
          }
          if(isDisabled || isTitle || isText){
            $(this).removeAttr("href");
            menuLine.bind(mouseOver,function(){
              if (closeOnMouseOut) clearTimeout($.mbMenu.deleteOnMouseOut);
              if(opener.menuContainer.actualSubmenu){
                $(opener.menu).find(".menuDiv").remove();
                opener.menuContainer.actualSubmenu=false;
              }
            }).css("cursor","default");
          }
          menuLine.bind("click",function(){
            if (($(voice).attr("action") || $(voice).attr("href")) && !isDisabled){
              var target=$(voice).attr("target")?$(voice).attr("target"):"_self";
              if ($(voice).attr("href") && $(voice).attr("href").indexOf("javascript:")>-1){
                $(voice).attr("action",$(voice).attr("href").replace("javascript:",""));
              }
              var link=$(voice).attr("action")?$(voice).attr("action"):"window.open('"+$(voice).attr("href")+"', '"+target+"')";
              $(voice).removeAttr("href");
              eval(link);
              $(this).removeMbMenu(op,true);
            }else if($(voice).attr("menu"))
              return false;
          });
        }
      });

      // Close on Mouseout

      var closeOnMouseOut=$(op)[0].options.closeOnMouseOut;
      if (closeOnMouseOut){
        $(opener.menuContainer).bind("mouseenter",function(){
          clearTimeout($.mbMenu.deleteOnMouseOut);
        });
        $(opener.menuContainer).bind("mouseleave",function(){
          var menuToRemove=$.mbMenu.options.actualMenuOpener;
          $.mbMenu.deleteOnMouseOut= setTimeout(function(){$(this).removeMbMenu(menuToRemove,true);$(document).unbind("click.closeMbMenu");},$(op)[0].options.closeAfter);
        });
      }

      //positioning opened
      var t=0,l=0;
      $(this.menuContainer).css({
        minWidth:op.options.menuWidth
      });
      if ($.browser.msie) $(this.menuContainer).css("width",$(this.menuContainer).width()+2);


      switch(type){
        case "sm":
          t=$(this).position().top+op.options.submenuTop;

          l=$(this).position().left+$(this).width()-op.options.submenuLeft;
          break;
        case "cm":
          t=this.mouseY-5;
          l=this.mouseX-5;
          break;
        default:
          if (op.options.openOnRight){
            t=$(this).offset().top-($.browser.msie?2:0)+op.options.menuTop;
            l=$(this).offset().left+$(this).outerWidth()-op.options.menuLeft-($.browser.msie?2:0);
          }else{
            t=$(this).offset().top+$(this).outerHeight()-(!$.browser.mozilla?2:0)+op.options.menuTop;
            l=$(this).offset().left+op.options.menuLeft;
          }
          break;
      }

      $(this.menu).css({
        position:"absolute",
        top:t,
        left:l
      });

      if (!type || type=="cm") op.rootMenu=this.menu;
      $(this.menuContainer).bind(mouseOut,function(){
        $(document).one("click.closeMbMenu",function(){$(document).removeMbMenu(op,true);});
      });

      if (op.options.fadeInTime>0) $(this.menuContainer).fadeIn(op.options.fadeInTime);
      else $(this.menuContainer).show();

      if (op.options.shadow) {
        $(this.menu).prepend(shadow);
        shadow.css({
          width:$(this.menuContainer).outerWidth(),
          height:$(this.menuContainer).outerHeight()-1,
          position:'absolute',
          backgroundColor:op.options.shadowColor,
          border:0,
          opacity:op.options.shadowOpacity
        }).show();
      }
      var wh= (op.options.containment=="window")?$(window).height():$("#"+op.options.containment).offset().top+$("#"+op.options.containment).outerHeight();
      var ww=(op.options.containment=="window")?$(window).width():$("#"+op.options.containment).offset().left+$("#"+op.options.containment).outerWidth();

      var mh=$(this.menuContainer).outerHeight();
      var mw=shadow?shadow.outerWidth():$(this.menuContainer).outerWidth();

      var actualX=$(where.find(".menuDiv:first")).offset().left-$(window).scrollLeft();
      var actualY=$(where.find(".menuDiv:first")).offset().top-$(window).scrollTop();
      switch(type){
        case "sm":
          if ((actualX+mw)>= ww && mw<ww){
            l-=((op.options.menuWidth*2)-(op.options.submenuLeft*2));
          }
          break;
        case "cm":
          if ((actualX+(op.options.menuWidth*1.5))>= ww && mw<ww){
            l-=((op.options.menuWidth)-(op.options.submenuLeft));
          }
          break;
        default:
          if ((actualX+mw)>= ww && mw<ww){
            l-=($(this.menuContainer).offset().left+mw)-ww+1;
          }
          break;
      }
      if ((actualY+mh)>= wh-10 && mh<wh){
        t-=((actualY+mh)-wh)+10;
      }

      $(this.menu).css({
        top:t,
        left:l
      });
    },
    removeMbMenu: function(op,fade){
      if(!op)op=$.mbMenu.options.actualMenuOpener;
      if(!op) return;
      if (op.rootMenu) {
        $(op.actualOpenedMenu)
                .removeAttr("isOpen")
                .removeClass("selected");
        $(op.rootMenu)
                .css({width:1, height:1});
        if (fade) $(op.rootMenu).fadeOut(op.options.fadeOutTime,function(){$(this).remove();});
        else $(op.rootMenu).remove();
        op.rootMenu=false;
        op.clicked=false;
      }
    },

    //mouse  Position
    getMouseX : function (e){
      var mouseX;
      if ($.browser.msie)mouseX = e.clientX + document.documentElement.scrollLeft;
      else mouseX = e.pageX;
      if (mouseX < 0) mouseX = 0;
      return mouseX;
    },
    getMouseY : function (e){
      var mouseY;
      if ($.browser.msie)	mouseY = e.clientY + document.documentElement.scrollTop;
      else mouseY = e.pageY;
      if (mouseY < 0)	mouseY = 0;
      return mouseY;
    },
    //get max z-inedex of the page
    mb_bringToFront: function(){
      var zi=10;
      $('*').each(function() {
        if($(this).css("position")=="absolute" || $(this).css("position")=="fixed" ){
          var cur = parseInt($(this).css('zIndex'));
          zi = cur > zi ? parseInt($(this).css('zIndex')) : zi;
        }
      });

      $(this).css('zIndex',zi+=10);
    }

  });
  $.fn.buildMenu = $.mbMenu.buildMenu;
  $.fn.buildContextualMenu = $.mbMenu.buildContextualMenu;
})(jQuery);