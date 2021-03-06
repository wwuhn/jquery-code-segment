$(document).ready(function(){
	
	var config = {
		siteURL		: 'xxx.com',	//更改为你的站点
		searchSite	: true,
		type		: 'web',
		append		: false,
		perPage		: 8,			// 每页最多8个搜索结果
		page		: 0				// 起始页
	}
	
	//标记当前搜索类型的活动小图标
	var arrow = $('<span>',{className:'arrow'}).appendTo('ul.icons');
	
	$('ul.icons li').click(function(){
		var el = $(this);
		
		if(el.hasClass('active')){
			//当前的图标已经处于活动毒药态
			return false;
		}
		
		el.siblings().removeClass('active');
		el.addClass('active');
		
		// Move the arrow below this icon
		arrow.stop().animate({
			left		: el.position().left,
			marginLeft	: (el.width()/2)-4
		});
		
		// 设置搜索类型
		config.type = el.attr('data-searchType');
		$('#more').fadeOut();
	});
	
	// Adding the site domain as a label for the first radio button:
	$('#siteNameLabel').append(' '+config.siteURL);
	
	// Marking the Search your site radio as active:
	$('#searchSite').click();	
	
	// Marking the web search icon as active:
	$('li.web').click();
	
	// Focusing the input text box:
	$('#s').focus();
    //搜索按钮的代码 
	$('#searchForm').submit(function(){
		googleSearch();      //调用googleSearch函数进行搜索
		return false;
	});
	
	$('#searchSite,#searchWeb').change(function(){
		// Listening for a click on one of the radio buttons.
		// config.searchSite is either true or false.
		
		config.searchSite = this.id == 'searchSite';
	});
	
	
	function googleSearch(settings){                    //settings表示配置参数	
		//如果没有提供任何参数，它将从上面的配置对象代码中取默认值	
		settings = $.extend({},config,settings);       
		settings.term = settings.term || $('#s').val();  //获取搜索关键词		
		if(settings.searchSite){        //使用site:xxx.com来限制搜索的网站域名
			settings.term = 'site:'+settings.siteURL+' '+settings.term;
		}		
		//Google AJAX的搜索API
		var apiURL = 'http://ajax.googleapis.com/ajax/services/search/'+settings.type+'?v=1.0&callback=?';
		var resultsDiv = $('#resultsDiv');
		//调用$.getJSON提交搜索请求并获取返回的JSON数组
		$.getJSON(apiURL,{q:settings.term,rsz:settings.perPage,start:settings.page*settings.perPage},function(r){
			var results = r.responseData.results;   	//获取返回结果
			$('#more').remove();			
			if(results.length){
				//如果返回了结果，将其添加到pageContainer div中，然后追加到#resultDiv中。
				var pageContainer = $('<div>',{className:'pageContainer'});
		     		
				for(var i=0;i<results.length;i++){
					//添加结果对象，并添加到pageContainer中，这里调用了result函数生成结果
					pageContainer.append(new result(results[i]) + '');
				}
				
				if(!settings.append){   //根据设置是添加显示结果还是全新显示结果
					resultsDiv.empty(); //如果不为append，则清空结果区域
				}
				//添加结果数据div到resultDiv中
				pageContainer.append('<div class="clear"></div>')
							 .hide().appendTo(resultsDiv)
							 .fadeIn('slow');
				
				var cursor = r.responseData.cursor;
				//检查是否有更多页的结果，以决定是否显示更多按钮			
				if( +cursor.estimatedResultCount > (settings.page+1)*settings.perPage){
					$('<div>',{id:'more'}).appendTo(resultsDiv).click(function(){
						googleSearch({append:true,page:settings.page+1});
						$(this).fadeOut();
					});
				}
			}
			else {				
				// 如果没有结果，则简单的显示一行没有找到搜索结果的消息				
				resultsDiv.empty();
				$('<p>',{className:'notFound',html:'没有找到搜索内容'}).hide().appendTo(resultsDiv).fadeIn();
			}
		});
	}
	
	function result(r){
		
		// This is class definition. Object of this class are created for
		// each result. The markup is generated by the .toString() method.
		
		var arr = [];
		
		// GsearchResultClass is passed by the google API
		switch(r.GsearchResultClass){

			case 'GwebSearch':
				arr = [
					'<div class="webResult">',
					'<h2><a href="',r.unescapedUrl,'" target="_blank">',r.title,'</a></h2>',
					'<p>',r.content,'</p>',
					'<a href="',r.unescapedUrl,'" target="_blank">',r.visibleUrl,'</a>',
					'</div>'
				];
			break;
			case 'GimageSearch':
				arr = [
					'<div class="imageResult">',
					'<a target="_blank" href="',r.unescapedUrl,'" title="',r.titleNoFormatting,'" class="pic" style="width:',r.tbWidth,'px;height:',r.tbHeight,'px;">',
					'<img src="',r.tbUrl,'" width="',r.tbWidth,'" height="',r.tbHeight,'" /></a>',
					'<div class="clear"></div>','<a href="',r.originalContextUrl,'" target="_blank">',r.visibleUrl,'</a>',
					'</div>'
				];
			break;
			case 'GvideoSearch':
				arr = [
					'<div class="imageResult">',
					'<a target="_blank" href="',r.url,'" title="',r.titleNoFormatting,'" class="pic" style="width:150px;height:auto;">',
					'<img src="',r.tbUrl,'" width="100%" /></a>',
					'<div class="clear"></div>','<a href="',r.originalContextUrl,'" target="_blank">',r.publisher,'</a>',
					'</div>'
				];
			break;
			case 'GnewsSearch':
				arr = [
					'<div class="webResult">',
					'<h2><a href="',r.unescapedUrl,'" target="_blank">',r.title,'</a></h2>',
					'<p>',r.content,'</p>',
					'<a href="',r.unescapedUrl,'" target="_blank">',r.publisher,'</a>',
					'</div>'
				];
			break;
		}
		
		// The toString method.
		this.toString = function(){
			return arr.join('');
		}
	}
	
	
});
