//$("#sortable").sortable();
//$("#sortable").disableSelection();

countTodos();

//create todo
$('.add-todo').on('keypress',function (e) {
      e.preventDefault
      if (e.which == 13) {
           if($(this).val() != ''){
           var todo = $(this).val();
            createTodo(todo); 
            countTodos();
           }else{
               // some validation
           }
      }
});
// mark task as done
$('.todolist').on('change','#sortable li input[type="checkbox"]',function(){
    if($(this).prop('checked')){
        var doneItem = $(this).parent().parent().find('label').text();
        $(this).parent().parent().parent().addClass('remove');
        done(doneItem);
        countTodos();
    }
});

//delete done task from "already done"
$('.todolist').on('click','.remove-item',function(){
  
    $.ajax({
        url: "/todoDeletePost",
        method: "POST",
        data: {todoDelete: $(this).parent().text()},

    });

    removeItem(this);
});

// count tasks
function countTodos(){
    var count = $("#sortable li").length;
    $('.count-todos').html(count);
}

//create task
function createTodo(text){
    var markup = '<li class="ui-state-default"><div class="checkbox"><label><input type="checkbox" value="" />'+ text +'</label></div></li>';
    $('#sortable').append(markup);
    
    $.ajax({
        url: "/todoPost",
        method: "POST",
        data: {todo: text},
        
    });

    $('.add-todo').val('');
}

//mark task as done
function done(doneItem){
    var done = doneItem;
    var markup = '<li>'+ done +'<button class="btn btn-default btn-xs pull-right  remove-item"><span class="glyphicon glyphicon-remove"></span></button></li>';
    $('#done-items').append(markup);
    
    $.ajax({
        url: "/todoDonePost",
        method: "POST",
        data: {todoDone: doneItem},
        
    });

    $('.remove').remove();
}

//remove done task from list
function removeItem(element){
    $(element).parent().remove();
}